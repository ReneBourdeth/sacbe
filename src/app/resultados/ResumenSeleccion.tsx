'use client'

import { useLang } from '@/lib/i18n'
import { formatoHora } from '@/lib/fecha'
import { CARGO_SERVICIO, totalConCargo } from '@/lib/precios'
import type { Viaje } from '@/lib/supabase'
import { S } from './estilos'

type Props = {
  viaje: Viaje | null
  onComprar: () => void
}

/** "Tu selección" box: price breakdown of the chosen trip and the buy button. */
export default function ResumenSeleccion({ viaje, onComprar }: Props) {
  const { t, locale } = useLang()

  return (
    <div style={S.sideCard}>
      <div style={S.sideLabel}>{t.tuSeleccion}</div>
      {!viaje ? (
        <p style={S.sideVacio}>{t.seleccionaViaje}</p>
      ) : (
        <>
          <div style={S.sideEmpresa}>{viaje.empresa}</div>
          <div style={S.sideHoras}>{formatoHora(viaje.salida, locale)} → {formatoHora(viaje.llegada_est, locale)}</div>
          <div style={S.sbLine}><span>{t.boleto}</span><strong>L. {viaje.precio}</strong></div>
          <div style={S.sbLine}><span>{t.cargoServicio}</span><strong>L. {CARGO_SERVICIO}</strong></div>
          <div style={S.sbTotal}><span>{t.total}</span><span>L. {totalConCargo(viaje.precio)}</span></div>
          <button className="sb-btn" style={S.btnComprar} onClick={onComprar}>{t.comprarBoleto}</button>
        </>
      )}
    </div>
  )
}
