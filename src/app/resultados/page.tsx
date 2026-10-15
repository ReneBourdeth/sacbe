'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ResultadosClient from './ResultadosClient'
import { getViajes, hoyHonduras } from '@/lib/api'
import type { Viaje } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

function ResultadosInner() {
  const searchParams = useSearchParams()
  const { t } = useLang()
  const origen = searchParams.get('origen') || 'SPS'
  const destino = searchParams.get('destino') || 'TGU'
  const fecha = searchParams.get('fecha') || hoyHonduras()

  const [viajes, setViajes] = useState<Viaje[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getViajes(origen, destino, fecha)
      .then(data => setViajes(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [origen, destino, fecha])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontFamily: 'serif', fontSize: '1.2rem', letterSpacing: 2 }}>
        {t.buscando}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', marginBottom: '1rem' }}>{t.errorViajes}</p>
          <p style={{ color: '#C8BFB0', fontSize: '.9rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <ResultadosClient
      viajes={viajes}
      origen={origen}
      destino={destino}
      fecha={fecha}
    />
  )
}

export default function ResultadosPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontFamily: 'serif', fontSize: '1.2rem', letterSpacing: 2 }}>
        Cargando...
      </div>
    }>
      <ResultadosInner />
    </Suspense>
  )
}
