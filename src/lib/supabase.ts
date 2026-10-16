import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for the browser. Uses the public (publishable) key, so it can
 * only do what Row Level Security allows. @supabase/ssr reuses one shared
 * instance, so calling this many times is cheap.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── Database row types (mirror docs/schema.sql) ─────────────

export type Clase = 'economica' | 'ejecutivo' | 'primera'

/** A row of the `v_viajes_disponibles` view: a bookable trip with its route details. */
export type Viaje = {
  id: string
  salida: string        // ISO timestamp
  llegada_est: string   // estimated arrival, ISO timestamp
  clase: Clase
  precio: number        // lempiras
  asientos_disp: number
  estado: string
  empresa: string
  empresa_logo: string | null
  origen: string
  origen_codigo: string
  destino: string
  destino_codigo: string
  duracion_min: number
}

export type Asiento = {
  id: string
  viaje_id: string
  numero: string        // e.g. "3B"
  fila: number          // row, 1 = front
  columna: string       // A–D; A/D are windows
  tipo: string
  estado: 'disponible' | 'reservado' | 'vendido' | 'bloqueado'
}

export type Boleto = {
  id: string
  codigo_qr: string
  nombre_pasajero: string
  estado: 'reservado' | 'pagado' | 'usado' | 'cancelado' | 'expirado'
  precio_final: number
  created_at: string
  viaje_id: string
  asiento_id: string
}
