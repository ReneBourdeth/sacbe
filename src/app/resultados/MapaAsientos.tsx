'use client'

import { useLang } from '@/lib/i18n'
import type { Asiento } from '@/lib/supabase'

type Props = {
  asientos: Asiento[]
  cargado: boolean
  seleccionados: Asiento[]
  onSeleccionar: (asiento: Asiento) => void
}

/**
 * The bus seen from above, drawn like the departures window's (globals.css .vv-*): rows of A B | C D,
 * front to back. Taken seats are hatched and can't be clicked; a click picks or drops a seat.
 */
export default function MapaAsientos({ asientos, cargado, seleccionados, onSeleccionar }: Props) {
  const { t } = useLang()
  const filas: Asiento[][] = []
  for (const a of asientos) (filas[a.fila - 1] ??= []).push(a)

  return (
    <div className="vv-bus vm-bus">
      <span className="vv-frente">{t.frente}</span>
      {asientos.length === 0 ? <p className="vv-guia">{cargado ? t.sinAsientos : t.cargandoAsientos}</p>
        : filas.filter(Boolean).map((fila, i) => (
          <div className="vv-fila-bus" key={i}>
            {fila.map(a => {
              const libre = a.estado === 'disponible'
              const tuyo = seleccionados.some(x => x.id === a.id)
              return (
                <button key={a.id} type="button" disabled={!libre} aria-pressed={tuyo} aria-label={`${t.asiento} ${a.numero}`}
                  className={`vv-asiento${a.columna === 'C' ? ' tras-pasillo' : ''}${!libre ? ' is-ocupado' : ''}${tuyo ? ' is-tuyo' : ''}`}
                  onClick={() => onSeleccionar(a)}>{a.numero}</button>
              )
            })}
          </div>
        ))}
    </div>
  )
}
