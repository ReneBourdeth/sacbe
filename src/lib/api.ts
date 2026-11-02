// All reads/writes to Supabase live here, so pages never build queries themselves.
// Security note: the browser only has the public key. Row Level Security
// (docs/schema.sql) decides what it may read, and anything that changes data
// goes through database functions like reservar_asiento.

import { createClient, type Asiento, type Clase, type Viaje } from './supabase'
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
  asientoId: string
  nombre: string
  identidad: string
  esMenor: boolean
}

/**
 * Books one or more seats (max 6) on a trip, all-or-nothing: the database
 * function reservar_varios books every seat in one transaction, checking that
 * each seat is still free (see docs/sprint1-reservas.sql). Price and user come
 * from the database/session, never from the browser.
 *
 * Throws an Error whose message contains ASIENTO_OCUPADO if any seat was taken
 * first, LIMITE_ASIENTOS over 6 per trip, LOGIN_REQUERIDO for guests.
 */
export async function reservarAsientos(viajeId: string, pasajeros: DatosPasajero[]) {
  const reservas = pasajeros.map(p => ({ ...p, codigoQr: generarCodigoBoleto() }))
  const { error } = await createClient().rpc('reservar_varios', {
    p_viaje_id: viajeId,
    p_reservas: reservas.map(r => ({
      asiento_id: r.asientoId, codigo_qr: r.codigoQr,
      nombre: r.nombre.trim(), identidad: r.identidad.trim(), es_menor: r.esMenor,
    })),
  })
  if (error) throw new Error(error.message)
  return reservas
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
      id, salida, clase, precio, capacidad, asientos_disp, estado,
      rutas!inner (
        empresa_id, duracion_min,
        origen:terminales!rutas_origen_id_fkey ( codigo ),
        destino:terminales!rutas_destino_id_fkey ( codigo )
      ),
      boletos ( id, nombre_pasajero, identidad_pas, estado, codigo_qr, precio_final, reembolso, reembolsado_at, asientos ( numero ) )
    `)
    .eq('rutas.empresa_id', empresaId)
    .gte('salida', desde)
    .lte('salida', hasta)
    .order('salida', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export type BoletoValidado = { nombre: string; asiento: string; salida: string; origen: string; destino: string }

/** Boarding check: marks a paid ticket of the staff's company as used. Errors: NO_ENCONTRADO, YA_USADO, NO_PAGADO, NO_VALIDO. */
export async function validarBoleto(codigo: string): Promise<BoletoValidado> {
  const { data, error } = await createClient().rpc('validar_boleto', { p_codigo: codigo.trim() })
  if (error) throw new Error(error.message)
  return data as BoletoValidado
}

export type RutaEmpresa = {
  id: string
  duracion_min: number
  precio_base: number
  origen: { codigo: string } | null
  destino: { codigo: string } | null
}

/** All routes of a company (RLS: staff only see their own). */
export async function getRutasEmpresa(empresaId: string): Promise<RutaEmpresa[]> {
  const { data, error } = await createClient()
    .from('rutas')
    .select('id, duracion_min, precio_base, origen:terminales!rutas_origen_id_fkey ( codigo ), destino:terminales!rutas_destino_id_fkey ( codigo )')
    .eq('empresa_id', empresaId)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as RutaEmpresa[]
}

/** New route for the staff member's company. The database refuses other companies. */
export async function crearRuta(empresaId: string, origen: string, destino: string, duracionMin: number, precioBase: number) {
  const supabase = createClient()
  const { data: terminales, error: e1 } = await supabase.from('terminales').select('id, codigo').in('codigo', [origen, destino])
  if (e1) throw new Error(e1.message)
  const id = (codigo: string) => terminales?.find(t => t.codigo === codigo)?.id
  const { error } = await supabase.from('rutas').insert({
    empresa_id: empresaId, origen_id: id(origen), destino_id: id(destino), duracion_min: duracionMin, precio_base: precioBase,
  })
  if (error) throw new Error(error.message)
}

/** New trip on one of the company's routes. Seats are created by a database trigger. */
export async function crearViaje(rutaId: string, salida: string, duracionMin: number, clase: Clase, precio: number) {
  const { error } = await createClient().from('viajes').insert({
    ruta_id: rutaId, salida, llegada_est: llegada(salida, duracionMin), clase, precio,
  })
  if (error) throw new Error(error.message)
}

/** Change a trip's departure time and price; arrival moves with it. */
export async function editarViaje(viajeId: string, salida: string, duracionMin: number, precio: number) {
  const { data, error } = await createClient().from('viajes')
    .update({ salida, llegada_est: llegada(salida, duracionMin), precio })
    .eq('id', viajeId)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('NO_PERMITIDO') // RLS hid the row: not this company's trip
}

function llegada(salida: string, duracionMin: number) {
  return new Date(new Date(salida).getTime() + duracionMin * 60_000).toISOString()
}

export type FilaIngresos = {
  origen: string; destino: string
  boletos_pagados: number; ingresos: number
  boletos_pendientes: number; monto_pendiente: number
}

/** Revenue per route between two Honduras dates (YYYY-MM-DD, inclusive), own company only. */
export async function getIngresos(desde: string, hasta: string): Promise<FilaIngresos[]> {
  const { data, error } = await createClient().rpc('reporte_ingresos', { p_desde: desde, p_hasta: hasta })
  if (error) throw new Error(error.message)
  // numeric columns arrive as strings
  return (data ?? []).map((f: FilaIngresos) => ({ ...f, ingresos: Number(f.ingresos), monto_pendiente: Number(f.monto_pendiente) }))
}

/** Passenger cancels their own ticket before departure. Returns the refund owed (0 if it wasn't paid). */
export async function cancelarBoleto(boletoId: string): Promise<number> {
  const { data, error } = await createClient().rpc('cancelar_boleto', { p_boleto_id: boletoId })
  if (error) throw new Error(error.message)
  return Number(data)
}

/** Staff confirm they paid a cancelled ticket's refund back (own company only). */
export async function marcarReembolsado(boletoId: string) {
  const { error } = await createClient().rpc('marcar_reembolsado', { p_boleto_id: boletoId })
  if (error) throw new Error(error.message)
}

/** Staff confirm a cash payment. The database refuses other companies' tickets. */
export async function marcarPagado(boletoId: string) {
  const { error } = await createClient().rpc('marcar_boleto_pagado', { p_boleto_id: boletoId })
  if (error) throw new Error(error.message)
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
