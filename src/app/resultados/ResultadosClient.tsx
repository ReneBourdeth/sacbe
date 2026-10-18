'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { formatoDia } from '@/lib/fecha'
import { nombreTerminal } from '@/lib/terminales'
import type { Clase, Viaje } from '@/lib/supabase'
import SiteHeader from '@/components/SiteHeader'
import TarjetaViaje from './TarjetaViaje'
import ResumenSeleccion from './ResumenSeleccion'
import ModalCompra from './ModalCompra'
import { S } from './estilos'

type Filtro = 'todos' | Clase
const FILTROS: Filtro[] = ['todos', 'economica', 'ejecutivo', 'primera']

type Props = {
  viajes: Viaje[]
  origen: string   // terminal code, e.g. 'SPS'
  destino: string
  fecha: string    // YYYY-MM-DD
}

/** Results screen: trip list with class filters, selection summary and the booking window. */
export default function ResultadosClient({ viajes, origen, destino, fecha }: Props) {
  const { t, locale } = useLang()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [elegido, setElegido] = useState<Viaje | null>(null)
  const [comprando, setComprando] = useState(false)

  const visibles = filtro === 'todos' ? viajes : viajes.filter(v => v.clase === filtro)

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <SiteHeader>
        <Link href="/" className="sb-hide-sm" style={S.back}>{t.cambiarBusqueda}</Link>
      </SiteHeader>

      {/* Route and date being shown */}
      <div style={S.subhead}>
        <span style={S.shRuta}>{nombreTerminal(origen)} — {nombreTerminal(destino)}</span>
        <span style={S.shFecha}>{formatoDia(fecha, locale)}</span>
        <Link href="/" style={S.shEdit}>{t.editar}</Link>
      </div>

      <div className="sb-layout">
        <section>
          <div style={S.chips}>
            {FILTROS.map(f => (
              <button key={f} onClick={() => setFiltro(f)} aria-pressed={filtro === f}
                style={{ ...S.chip, ...(filtro === f ? S.chipOn : {}) }}>
                {t[f]}
              </button>
            ))}
          </div>

          {visibles.length === 0 ? (
            <div style={S.noResults}>
              <div style={S.noResultsTitulo}>{t.sinResultados}</div>
              <p style={S.noResultsSub}>{t.otraFecha}</p>
            </div>
          ) : visibles.map(v => (
            <TarjetaViaje key={v.id} viaje={v} elegido={elegido?.id === v.id} onElegir={() => setElegido(v)} />
          ))}
        </section>

        {/* Sticks to the side on desktop, to the bottom of the screen on phones (globals.css) */}
        <aside className="sb-side">
          <ResumenSeleccion viaje={elegido} onComprar={() => setComprando(true)} />
        </aside>
      </div>

      {comprando && elegido && <ModalCompra viaje={elegido} onCerrar={() => setComprando(false)} />}
    </main>
  )
}
