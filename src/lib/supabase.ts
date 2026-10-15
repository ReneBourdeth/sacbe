import { createBrowserClient } from '@supabase/ssr'

// Browser client only — safe to use anywhere
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

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