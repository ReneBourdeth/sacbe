'use client'

import { useEffect, useState } from 'react'
import { escucharAsientos, getAsientos } from '@/lib/api'
import type { Asiento } from '@/lib/supabase'

/**
 * Loads a trip's seats and keeps them up to date live, so a seat someone else
 * just booked turns grey without reloading.
 * `cargado` tells "still loading" apart from "this trip has no seats".
 */
export function useAsientos(viajeId: string) {
  const [asientos, setAsientos] = useState<Asiento[]>([])
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    let activo = true // ignore late answers after the window closes
    setCargado(false)

    getAsientos(viajeId)
      .then(lista => { if (activo) setAsientos(lista) })
      .catch(() => { if (activo) setAsientos([]) })
      .finally(() => { if (activo) setCargado(true) })

    const dejarDeEscuchar = escucharAsientos(viajeId, lista => { if (activo) setAsientos(lista) })
    return () => { activo = false; dejarDeEscuchar() }
  }, [viajeId])

  return { asientos, cargado }
}
