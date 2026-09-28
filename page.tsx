import { createServerSupabase } from '@/lib/supabase'
import ResultadosClient from './ResultadosClient'

interface Props {
  searchParams: { origen: string; destino: string; fecha: string }
}

// ── Server component: fetches trips, passes to client
export default async function ResultadosPage({ searchParams }: Props) {
  const { origen, destino, fecha } = searchParams
  const supabase = createServerSupabase()

  const fechaStart = `${fecha}T00:00:00`
  const fechaEnd   = `${fecha}T23:59:59`

  const { data: viajes } = await supabase
    .from('v_viajes_disponibles')
    .select('*')
    .eq('origen_codigo', origen)
    .eq('destino_codigo', destino)
    .gte('salida', fechaStart)
    .lte('salida', fechaEnd)
    .order('salida', { ascending: true })

  return (
    <ResultadosClient
      viajes={viajes || []}
      origen={origen}
      destino={destino}
      fecha={fecha}
    />
  )
}
