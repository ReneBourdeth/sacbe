'use client'

import { useRef, useState } from 'react'
import { useLang } from '@/lib/i18n'

export type Clase = 'economica' | 'ejecutivo' | 'primera'
export type FilaViaje = { id: string; empresa: string; hora: string; clase: Clase; precio: number; disp: number }
export type AsientoBus = { id: string; numero: string; columna: string; libre: boolean }

const FILTROS = ['todos', 'economica', 'ejecutivo', 'primera'] as const
type Filtro = typeof FILTROS[number]

type Props = {
  titulo: string                        // the window's crumb, e.g. "San Pedro Sula → Tegucigalpa · martes 24"
  filas: FilaViaje[]
  elegido: string | null
  onElegir: (id: string) => void
  asientos: AsientoBus[] | null         // null while loading
  marcados: string[]                    // seat ids picked
  onAsiento: (a: AsientoBus) => void
  total: number                         // L, for the picked seats
  onContinuar: () => void
  vacio?: React.ReactNode               // shown in the list when there are no trips
}

/**
 * The departures window: class filters, the day's departures, and the open bus's seat map with the total.
 * The home page shows it with sample trips; the results page with the real ones (same look, same clicks).
 */
export default function VentanaViajes({ titulo, filas, elegido, onElegir, asientos, marcados, onAsiento, total, onContinuar, vacio }: Props) {
  const { t } = useLang()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const mapa = useRef<HTMLDivElement>(null)
  // stacked (phones, small tablets): a picked departure scrolls its seats into view
  function elegir(id: string) {
    onElegir(id)
    if (matchMedia('(max-width: 900px)').matches) setTimeout(() => mapa.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const visibles = filtro === 'todos' ? filas : filas.filter(f => f.clase === filtro)
  const viaje = filas.find(f => f.id === elegido) ?? null
  const cuenta = (f: Filtro) => f === 'todos' ? filas.length : filas.filter(x => x.clase === f).length

  // rows of the bus: A B | C D, front to back
  const filasBus: AsientoBus[][] = []
  for (const a of asientos ?? []) {
    const n = parseInt(a.numero, 10) - 1
    ;(filasBus[n] ??= []).push(a)
  }

  return (
    <div className="vv">
      <div className="vv-lista">
        <div className="vv-barra"><span className="vv-puntos" aria-hidden="true"><i /><i /><i /></span><span>Sacbé <span aria-hidden="true">/</span> <b>{titulo}</b></span></div>
        <div className="vv-cuerpo">
          <div className="vv-filtros" role="group" aria-label={t.filtrarClase}>
            {FILTROS.map(f => (
              <button key={f} type="button" className={`vv-filtro${filtro === f ? ' is-on' : ''}`} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
                <span><i className="vv-punto" data-clase={f} aria-hidden="true" />{t[f]}</span><em>{cuenta(f)}</em>
              </button>
            ))}
          </div>
          <div className="vv-filas">
            {visibles.length === 0 ? <div className="vv-vacio">{vacio ?? t.sinResultados}</div> : visibles.map(f => (
              <button key={f.id} type="button" className={`vv-fila${f.id === elegido ? ' is-on' : ''}`} aria-pressed={f.id === elegido} onClick={() => elegir(f.id)}>
                <i className="vv-punto" data-clase={f.clase} aria-hidden="true" />
                <span><b>{f.empresa}</b><small>{f.hora} · {t[f.clase]} · L {f.precio}</small></span>
                <span className={`vv-chip${f.disp <= 5 ? ' is-pocos' : ''}`}>{f.disp} {t.disp}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="vv-asientos" ref={mapa}>
        {!viaje ? <p className="vv-guia">{t.eligeSalida}</p> : (
          <>
            <div className="vv-head">
              <div><b>{viaje.empresa} · {viaje.hora}</b><small>{t[viaje.clase]} · L {viaje.precio}</small></div>
              <div className="vv-leyenda" aria-hidden="true"><span><i />{t.libre}</span><span><i className="is-ocupado" />{t.ocupado}</span><span><i className="is-tuyo" />{t.tuyo}</span></div>
            </div>
            <div className="vv-bus">
              <span className="vv-frente">{t.frente}</span>
              {asientos === null ? <p className="vv-guia">{t.cargandoAsientos}</p>
                : asientos.length === 0 ? <p className="vv-guia">{t.sinAsientos}</p>
                : filasBus.filter(Boolean).map((fila, i) => (
                  <div className="vv-fila-bus" key={i}>
                    {fila.map(a => {
                      const tuyo = marcados.includes(a.id)
                      return (
                        <button key={a.id} type="button" disabled={!a.libre} aria-pressed={tuyo} aria-label={`${t.asiento} ${a.numero}`}
                          className={`vv-asiento${a.columna === 'C' ? ' tras-pasillo' : ''}${!a.libre ? ' is-ocupado' : ''}${tuyo ? ' is-tuyo' : ''}`}
                          onClick={() => onAsiento(a)}>{a.numero}</button>
                      )
                    })}
                  </div>
                ))}
            </div>
            <div className="vv-pie">
              <span>{t.asientosTotal(marcados.length, total)}</span>
              <button type="button" className="sb-btn vv-continuar" disabled={marcados.length === 0} onClick={onContinuar}>{t.continuar}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
