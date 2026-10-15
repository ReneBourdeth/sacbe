'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ResultadosClient from './ResultadosClient'
import { getViajes } from '@/lib/api'
import type { Viaje } from '@/lib/supabase'

export default function ResultadosPage() {
  const searchParams = useSearchParams()
  const origen = searchParams.get('origen') || 'SPS'
  const destino = searchParams.get('destino') || 'TGU'
  const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]

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
        Buscando viajes...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', marginBottom: '1rem' }}>Error al cargar viajes</p>
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
