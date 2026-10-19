// All reads/writes to Supabase live here, so pages never build queries themselves.
// Security note: the browser only has the public key. Row Level Security
// (docs/schema.sql) decides what it may read, and anything that changes data
// goes through database functions like reservar_asiento.

import { createClient, type Asiento, type Viaje } from './supabase'
import { OFFSET_HONDURAS } from './fecha'

/**
 * Start and end of a day (YYYY-MM-DD) in Honduras time, for filtering `salida`.
 * `salida` is a timestamp with timezone: without the offset Postgres would read
 * these as UTC and drop every trip leaving after 6 PM Honduras time.
 */
function rangoDia(fecha: string) {
  return { desde: `${fecha}T00:00:00${OFFSET_HONDURAS}`, hasta: `${fecha}T23:59:59${OFFSET_HONDURAS}` }
}

/** Trips for a route on a given day (YYYY-MM-DD, Honduras time), earliest first. */
export async function getViajes(origen: string, destino: string, fecha: string): Promise<Viaje[]> {
  const { desde, hasta } = rangoDia(fecha)

  const { data, error } = await createClient()
    .from('v_viajes_disponibles') // view: only future, scheduled trips with free seats
    .select('*')
    .eq('origen_codigo', origen)
    .eq('destino_codigo', destino)
    .gte('salida', desde)
    .lte('salida', hasta)
    .order('salida', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** All seats of a trip, front to back. */
export async function getAsientos(viajeId: string): Promise<Asiento[]> {
  const { data, error } = await createClient()
    .from('asientos')
    .select('*')
    .eq('viaje_id', viajeId)
    .order('fila', { ascending: true })
    .order('columna', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Calls `onChange` with the fresh seat list whenever any seat of the trip changes
 * (e.g. someone else books one). Returns a function that stops listening.
 */
export function escucharAsientos(viajeId: string, onChange: (asientos: Asiento[]) => void) {
  const supabase = createClient()
  const canal = supabase
    // Unique name: Supabase reuses a same-named channel that may still be closing
    .channel(`asientos-${viajeId}-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'asientos',
      filter: `viaje_id=eq.${viajeId}`,
    }, async () => onChange(await getAsientos(viajeId)))
    .subscribe()

  return () => { supabase.removeChannel(canal) }
}

export type DatosPasajero = {
  nombre: string
  identidad: string
  esMenor: boolean
  tutorNombre?: string
  tutorIdentidad?: string
}

/**
 * Books a seat. The database function does it all in one transaction:
 * claims the seat only if still free, creates the ticket and lowers the
 * seat count (see docs/sprint1-reservas.sql). Price and user are taken
 * from the database/session, never from the browser.
 *
 * Throws an Error whose message contains ASIENTO_OCUPADO if someone else
 * took the seat first.
 */
export async function reservarAsiento(viajeId: string, asientoId: string, pasajero: DatosPasajero) {
  const codigoQr = generarCodigoBoleto()

  const { data, error } = await createClient().rpc('reservar_asiento', {
    p_viaje_id:        viajeId,
    p_asiento_id:      asientoId,
    p_codigo_qr:       codigoQr,
    p_nombre_pasajero: pasajero.nombre,
    p_identidad_pas:   pasajero.identidad,
    p_es_menor:        pasajero.esMenor,
    p_tutor_nombre:    pasajero.tutorNombre || null,
    p_tutor_identidad: pasajero.tutorIdentidad || null,
  })

  if (error) throw new Error(error.message)
  return { boletoId: data as string, codigoQr }
}

/** Tickets of the logged-in user, newest first (RLS only returns their own). */
export async function getMisBoletos(usuarioId: string) {
  const { data, error } = await createClient()
    .from('boletos')
    .select(`
      *,
      viajes (
        salida, llegada_est, precio, clase,
        rutas (
          duracion_min,
          empresas ( nombre ),
          origen:terminales!rutas_origen_id_fkey ( nombre, codigo ),
          destino:terminales!rutas_destino_id_fkey ( nombre, codigo )
        )
      ),
      asientos ( numero )
    `)
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// ── Bus company panel (/panel) ─────────────────────────────
// Staff rows are only visible to staff of that company (docs/panel-empresa.sql).

/** Company the logged-in user manages, or null if they are not staff. */
export async function getMiEmpresa() {
  const { data, error } = await createClient()
    .from('empresa_usuarios')
    .select('empresa_id, empresas ( nombre )')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as { empresa_id: string; empresas: { nombre: string } | null } | null
}

/** A company's trips on one day, with the passenger list of each, earliest first. */
export async function getViajesEmpresa(empresaId: string, fecha: string) {
  const { desde, hasta } = rangoDia(fecha)
  const { data, error } = await createClient()
    .from('viajes')
    .select(`
      id, salida, clase, capacidad, asientos_disp, estado,
      rutas!inner (
        empresa_id,
        origen:terminales!rutas_origen_id_fkey ( codigo ),
        destino:terminales!rutas_destino_id_fkey ( codigo )
      ),
      boletos ( id, nombre_pasajero, identidad_pas, estado, codigo_qr, precio_final, asientos ( numero ) )
    `)
    .eq('rutas.empresa_id', empresaId)
    .gte('salida', desde)
    .lte('salida', hasta)
    .order('salida', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// ── Helpers ────────────────────────────────────────────────

/** Short, readable, practically unique ticket code, e.g. SCB-MVA72JCP-RPPS. */
function generarCodigoBoleto() {
  const tiempo = Date.now().toString(36).toUpperCase()
  const azar = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SCB-${tiempo}-${azar}`
}

// NOTE: QR validation for bus staff (marking a ticket as used) belongs to
// Sprint 3. It must run as a database function restricted to staff accounts,
// so it is intentionally not implemented in the browser.
