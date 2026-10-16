'use client'

import { useLang } from '@/lib/i18n'
import { formatoHora } from '@/lib/fecha'
import { nombreTerminal } from '@/lib/terminales'
import type { Viaje } from '@/lib/supabase'
import { S } from './estilos'

// Dot color per travel class
const COLOR_CLASE: Record<Viaje['clase'], string> = {
  economica: 'var(--dorado3)',
  ejecutivo: 'var(--dorado)',
  primera: '#a78bfa',
}

// Fewer free seats than this shows a red "almost full" warning
const POCOS_ASIENTOS = 5

type Props = {
  viaje: Viaje
  elegido: boolean
  onElegir: () => void
}

/** One trip in the results list. The whole card is clickable. */
export default function TarjetaViaje({ viaje, elegido, onElegir }: Props) {
  const { t, locale } = useLang()
  const horas = Math.floor(viaje.duracion_min / 60)
  const minutos = viaje.duracion_min % 60
  const casiLleno = viaje.asientos_disp <= POCOS_ASIENTOS

  return (
    <div className="sb-trip" onClick={onElegir} style={{ ...S.tripCard, ...(elegido ? S.tripSel : {}) }}>
      {/* The order of these 5 blocks matters: globals.css rearranges them on small screens */}
      <div>
        <div style={S.tripEmp}>{viaje.empresa}</div>
        <div style={S.tripClase}>
          <span style={{ ...S.dot, background: COLOR_CLASE[viaje.clase] }} />
          {t[viaje.clase]}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={S.hora}>{formatoHora(viaje.salida, locale)}</div>
        <div style={S.ciudadLabel}>{nombreTerminal(viaje.origen_codigo)}</div>
      </div>

      <div style={S.rutaMid}>
        <span style={S.duracion}>{horas}h {minutos ? `${minutos}m` : ''}</span>
        <div style={S.rutaLine} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={S.hora}>{formatoHora(viaje.llegada_est, locale)}</div>
        <div style={S.ciudadLabel}>{nombreTerminal(viaje.destino_codigo)}</div>
      </div>

      <div style={S.precioCol}>
        <div style={S.precio}>L. {viaje.precio}</div>
        <div style={{ fontSize: '.68rem', color: casiLleno ? 'var(--rojo)' : 'var(--dorado3)' }}>
          {casiLleno ? t.asientosPocos(viaje.asientos_disp) : t.asientosDisp(viaje.asientos_disp)}
        </div>
        <button style={{ ...S.btnSel, ...(elegido ? S.btnSelOn : {}) }}
          onClick={e => { e.stopPropagation(); onElegir() }}>
          {elegido ? t.elegido : t.elegir}
        </button>
      </div>
    </div>
  )
}
