'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { formatoDia, hora24Honduras } from '@/lib/fecha'
import { nombreTerminal } from '@/lib/terminales'
import { totalConCargo } from '@/lib/precios'
import type { Viaje } from '@/lib/supabase'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'
import VentanaViajes, { type AsientoBus } from '@/components/VentanaViajes'
import { useAsientos } from './useAsientos'
import ModalCompra from './ModalCompra'
import { S } from './estilos'

// Same limit the database enforces per person and trip
const MAX_ASIENTOS = 6

type Props = {
  viajes: Viaje[]
  origen: string   // terminal code, e.g. 'SPS'
  destino: string
  fecha: string    // YYYY-MM-DD
  proximoDia: string | null // next day with buses when `viajes` is empty, null if the route has none
}

/**
 * Results screen: the day's departures in the same window the home page shows (filters, list, seat map),
 * here with the real trips and live seats; Continue opens the booking window on the passengers' step.
 */
export default function ResultadosClient({ viajes, origen, destino, fecha, proximoDia }: Props) {
  const { t, locale } = useLang()
  const [elegidoId, setElegidoId] = useState<string | null>(viajes[0]?.id ?? null)
  const [marcados, setMarcados] = useState<string[]>([])
  const [comprando, setComprando] = useState(false)
  const { asientos, cargado } = useAsientos(elegidoId)

  const viaje = viajes.find(v => v.id === elegidoId) ?? null
  const ruta = `${nombreTerminal(origen)} → ${nombreTerminal(destino)}`

  function elegir(id: string) { if (id !== elegidoId) { setElegidoId(id); setMarcados([]) } }
  function alternar(a: AsientoBus) {
    if (marcados.includes(a.id)) return setMarcados(m => m.filter(x => x !== a.id))
    if (marcados.length >= MAX_ASIENTOS) return alert(t.limiteAsientos)
    setMarcados(m => [...m, a.id])
  }
  // a seat someone else just took drops out of the picked ones
  const libres = new Set(asientos.filter(a => a.estado === 'disponible').map(a => a.id))
  const tuyos = marcados.filter(id => libres.has(id))

  const vacio = (
    <>
      <b>{t.sinResultados}</b>
      {viajes.length > 0 ? <span>{t.otraFecha}</span>
        : proximoDia ? (
          <Link href={`/resultados?${new URLSearchParams({ origen, destino, fecha: proximoDia })}`} style={S.proximoDia}>
            {t.proximoDia(formatoDia(proximoDia, locale))}
          </Link>
        ) : <span>{t.sinRuta}</span>}
    </>
  )

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <SiteHeader>
        <a href="/" className="sb-hide-sm" style={S.back}>{t.cambiarBusqueda}</a>
      </SiteHeader>

      {/* Route and date being shown */}
      <div style={S.subhead}>
        <h1 className="sb-titulo-pagina" style={S.shRuta}>{ruta}</h1>
        <span style={S.shFecha}>{formatoDia(fecha, locale)}</span>
        <a href="/" style={S.shEdit}>{t.editar}</a>
      </div>

      <div className="sb-ventana">
        <VentanaViajes
          titulo={ruta}
          filas={viajes.map(v => ({ id: v.id, empresa: v.empresa, hora: hora24Honduras(v.salida), clase: v.clase, precio: v.precio, disp: v.asientos_disp }))}
          elegido={elegidoId}
          onElegir={elegir}
          asientos={!viaje ? [] : cargado || asientos.length ? asientos.map(a => ({ id: a.id, numero: a.numero, columna: a.columna, libre: a.estado === 'disponible' })) : null}
          marcados={tuyos}
          onAsiento={alternar}
          total={viaje ? tuyos.length * totalConCargo(viaje.precio) : 0}
          onContinuar={() => setComprando(true)}
          vacio={vacio}
        />
      </div>

      {comprando && viaje && (
        <ModalCompra viaje={viaje} inicial={asientos.filter(a => tuyos.includes(a.id))}
          onCerrar={() => { setComprando(false); setMarcados([]) }} />
      )}
      <SiteFooter />
    </main>
  )
}
