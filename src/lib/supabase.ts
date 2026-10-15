import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ── Browser client (use in components / client components)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── Server client (use in API routes / server components)
export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}

// ── Types
export type Viaje = {
  id: string
  salida: string
  llegada_est: string
  clase: 'economica' | 'ejecutivo' | 'primera'
  precio: number
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
  numero: string
  fila: number
  columna: string
  tipo: string
  estado: 'disponible' | 'reservado' | 'vendido' | 'bloqueado'
}

export type Boleto = {
  id: string
  codigo_qr: string
  nombre_pasajero: string
  estado: string
  precio_final: number
  created_at: string
  viaje_id: string
  asiento_id: string
}
