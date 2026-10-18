'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getViajes } from '@/lib/api'
import { hoyHonduras } from '@/lib/fecha'
import { useLang } from '@/lib/i18n'
import type { Viaje } from '@/lib/supabase'
import ResultadosClient from './ResultadosClient'

/**
 * /resultados?origen=SPS&destino=TGU&fecha=2026-10-15
 * Reads the search from the URL, loads matching trips, then hands them to
 * ResultadosClient. Shows a loading or error screen in between.
 */
function ResultadosInner() {
  const searchParams = useSearchParams()
  const { t } = useLang()
  const origen = searchParams.get('origen') || 'SPS'
  const destino = searchParams.get('destino') || 'TGU'
  const fecha = searchParams.get('fecha') || hoyHonduras()

  const [viajes, setViajes] = useState<Viaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCargando(true)
    setError('')
    getViajes(origen, destino, fecha)
      .then(setViajes)
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))
  }, [origen, destino, fecha])

  if (cargando) return <div style={S.pantalla}>{t.buscando}</div>

  if (error) {
    return (
      <div style={{ ...S.pantalla, flexDirection: 'column', gap: '1rem' }}>
        <p>{t.errorViajes}</p>
        <p style={{ color: 'var(--tenue)', fontSize: '.95rem', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>{error}</p>
      </div>
    )
  }

  return <ResultadosClient viajes={viajes} origen={origen} destino={destino} fecha={fecha} />
}

// useSearchParams needs a Suspense boundary in Next.js 14, or the build fails
export default function ResultadosPage() {
  return (
    <Suspense fallback={<div style={S.pantalla}>…</div>}>
      <ResultadosInner />
    </Suspense>
  )
}

const S: Record<string, React.CSSProperties> = {
  pantalla: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', color: 'var(--tinta)', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 },
}
