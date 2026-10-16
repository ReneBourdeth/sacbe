'use client'

import { useLang } from '@/lib/i18n'
import type { Asiento } from '@/lib/supabase'
import { S } from './estilos'

type Props = {
  asientos: Asiento[]
  cargado: boolean
  seleccionado: Asiento | null
  onSeleccionar: (asiento: Asiento) => void
}

/**
 * Bus seat map, drawn as rows of 4 seats with an aisle in the middle:
 *   A B | C D
 * Taken seats are greyed out and can't be clicked.
 */
export default function MapaAsientos({ asientos, cargado, seleccionado, onSeleccionar }: Props) {
  const { t } = useLang()

  // Front row first, then left to right
  const ordenados = [...asientos].sort((a, b) => a.fila - b.fila || a.columna.localeCompare(b.columna))

  return (
    <div style={S.busShell}>
      <div style={S.busFront}>
        <span style={S.busFrontText}>{t.frente}</span>
      </div>

      {/* 5-column grid: 2 seats, aisle, 2 seats */}
      <div style={S.busGrid}>
        {ordenados.length === 0 ? (
          <p style={S.busVacio}>{cargado ? t.sinAsientos : t.cargandoAsientos}</p>
        ) : ordenados.flatMap(asiento => {
          const libre = asiento.estado === 'disponible'
          const celda = (
            <button key={asiento.id} type="button" disabled={!libre}
              aria-pressed={seleccionado?.id === asiento.id}
              aria-label={`${t.asiento} ${asiento.numero}`}
              onClick={() => onSeleccionar(asiento)}
              style={{
                ...S.seat,
                ...(!libre ? S.seatOcu : {}),
                ...(seleccionado?.id === asiento.id ? S.seatSel : {}),
              }}>
              {asiento.numero}
            </button>
          )
          // Empty cell after column B = the aisle
          return asiento.columna === 'B'
            ? [celda, <div key={`pasillo-${asiento.fila}`} aria-hidden />]
            : [celda]
        })}
      </div>
    </div>
  )
}
