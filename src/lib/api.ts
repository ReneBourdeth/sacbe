import { createClient } from './supabase'

// Honduras is UTC-6 year-round (no DST)
const HN_OFFSET = '-06:00'

// ── Today's date (YYYY-MM-DD) in Honduras, not UTC
export function hoyHonduras() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tegucigalpa' }).format(new Date())
}

// ── Search trips
export async function getViajes(origen: string, destino: string, fecha: string) {
  const supabase = createClient()
  // salida is timestamptz — without an offset Postgres reads these as UTC,
  // which drops every trip departing after 6 PM Honduras time
  const fechaStart = `${fecha}T00:00:00${HN_OFFSET}`
  const fechaEnd   = `${fecha}T23:59:59${HN_OFFSET}`

  const { data, error } = await supabase
    .from('v_viajes_disponibles')
    .select('*')
    .eq('origen_codigo', origen)
    .eq('destino_codigo', destino)
    .gte('salida', fechaStart)
    .lte('salida', fechaEnd)
    .order('salida', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// ── Get seats for a trip
export async function getAsientos(viajeId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('asientos')
    .select('*')
    .eq('viaje_id', viajeId)
    .order('fila', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// ── Reserve a seat (atomic — prevents double-booking)
export async function reservarAsiento(
  viajeId: string,
  asientoId: string,
  pasajero: {
    nombre: string
    identidad: string
    esMenor: boolean
    tutorNombre?: string
    tutorIdentidad?: string
  }
) {
  const supabase = createClient()

  // Generate unique QR code
  const codigoQr = `SCB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`

  // RPC does the whole booking atomically (see docs/sprint1-reservas.sql):
  // price comes from the DB and the user comes from the session, not the browser
  const { data, error } = await supabase.rpc('reservar_asiento', {
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

// ── Get user tickets
export async function getMisBoletos(usuarioId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
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

// ── Validate QR (for bus company staff)
export async function validarQR(codigoQr: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('boletos')
    .select(`
      *,
      viajes ( salida, rutas ( empresas(nombre), origen:terminales!rutas_origen_id_fkey(nombre), destino:terminales!rutas_destino_id_fkey(nombre) ) ),
      asientos ( numero )
    `)
    .eq('codigo_qr', codigoQr)
    .single()

  if (error || !data) return { valid: false, error: 'Boleto no encontrado' }
  if (data.estado === 'usado')     return { valid: false, error: 'Boleto ya utilizado', boleto: data }
  if (data.estado === 'cancelado') return { valid: false, error: 'Boleto cancelado' }

  // Mark as used
  await supabase
    .from('boletos')
    .update({ estado: 'usado' })
    .eq('codigo_qr', codigoQr)

  return { valid: true, boleto: data }
}

// ── Subscribe to seat changes in real-time
export function subscribeAsientos(viajeId: string, callback: (asientos: any[]) => void) {
  const supabase = createClient()
  return supabase
    .channel(`asientos-${viajeId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'asientos',
      filter: `viaje_id=eq.${viajeId}`,
    }, async () => {
      const asientos = await getAsientos(viajeId)
      callback(asientos || [])
    })
    .subscribe()
}
