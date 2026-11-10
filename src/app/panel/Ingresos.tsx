'use client'

import { useEffect, useState } from 'react'
import { getIngresos, type FilaIngresos } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { hoyHonduras, mesDe } from '@/lib/fecha'
import { nombreTerminal } from '@/lib/terminales'

/** Revenue report: paid and unpaid tickets per route for a date range (this month by default). */
export default function Ingresos({ recarga }: { recarga: number }) {
  const { t, locale } = useLang()
  const [rango, setRango] = useState(() => mesDe(hoyHonduras()))
  const [filas, setFilas] = useState<FilaIngresos[] | null>(null)

  useEffect(() => {
    let activo = true // drop answers for a range that is no longer selected
    setFilas(null)
    getIngresos(rango.desde, rango.hasta)
      .then(f => { if (activo) setFilas(f) })
      .catch(() => { if (activo) setFilas([]) })
    return () => { activo = false }
  }, [rango, recarga])

  const lempiras = (n: number) => `L. ${n.toLocaleString(locale, { maximumFractionDigits: 2 })}`
  const total = (filas ?? []).reduce((a, f) => ({
    pagados: a.pagados + Number(f.boletos_pagados), ingresos: a.ingresos + f.ingresos,
    pendientes: a.pendientes + Number(f.boletos_pendientes), monto: a.monto + f.monto_pendiente,
  }), { pagados: 0, ingresos: 0, pendientes: 0, monto: 0 })

  return (
    <section style={S.caja}>
      <div style={S.barra}>
        <h2 style={{ fontSize: '1.3rem' }}>{t.ingresos}</h2>
        <label style={S.campo}>{t.desde}
          <input type="date" value={rango.desde} max={rango.hasta} onChange={e => setRango(r => ({ ...r, desde: e.target.value }))} style={S.input} />
        </label>
        <label style={S.campo}>{t.hasta}
          <input type="date" value={rango.hasta} min={rango.desde} onChange={e => setRango(r => ({ ...r, hasta: e.target.value }))} style={S.input} />
        </label>
      </div>

      {filas === null ? <p style={S.muted}>{t.cargando}</p>
        : filas.length === 0 ? <p style={S.muted}>{t.sinVentas}</p>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.tabla}>
              <thead>
                <tr>
                  <th style={S.th}>{t.ruta}</th>
                  <th style={S.thNum}>{t.pagados}</th>
                  <th style={S.thNum}>{t.ingresos}</th>
                  <th style={S.thNum}>{t.pendientes}</th>
                  <th style={S.thNum} />
                </tr>
              </thead>
              <tbody>
                {filas.map(f => (
                  <tr key={f.origen + f.destino}>
                    <td style={S.td}>{nombreTerminal(f.origen)} → {nombreTerminal(f.destino)}</td>
                    <td style={S.tdNum}>{f.boletos_pagados}</td>
                    <td style={{ ...S.tdNum, color: 'var(--verde)', fontWeight: 700 }}>{lempiras(f.ingresos)}</td>
                    <td style={S.tdNum}>{f.boletos_pendientes}</td>
                    <td style={{ ...S.tdNum, color: 'var(--tenue)' }}>{lempiras(f.monto_pendiente)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={S.tdTotal}>{t.total}</td>
                  <td style={{ ...S.tdTotal, textAlign: 'right' }}>{total.pagados}</td>
                  <td style={{ ...S.tdTotal, textAlign: 'right', color: 'var(--verde)' }}>{lempiras(total.ingresos)}</td>
                  <td style={{ ...S.tdTotal, textAlign: 'right' }}>{total.pendientes}</td>
                  <td style={{ ...S.tdTotal, textAlign: 'right', color: 'var(--tenue)' }}>{lempiras(total.monto)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
    </section>
  )
}

const S: Record<string, React.CSSProperties> = {
  caja: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 'var(--radio)', padding: '1rem 1.25rem', marginBottom: '1.5rem' },
  barra: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '1rem', marginBottom: '.75rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.85rem', color: 'var(--tenue)' },
  input: { height: 40, padding: '0 10px', background: 'var(--hundido)', border: '1px solid var(--borde)' },
  muted: { color: 'var(--tenue)' },
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: '.95rem' },
  th: { textAlign: 'left', color: 'var(--tenue)', fontWeight: 500, padding: '6px 8px', borderBottom: '1px solid var(--borde)' },
  thNum: { textAlign: 'right', color: 'var(--tenue)', fontWeight: 500, padding: '6px 8px', borderBottom: '1px solid var(--borde)' },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--borde2)' },
  tdNum: { padding: '6px 8px', borderBottom: '1px solid var(--borde2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  tdTotal: { padding: '8px', fontWeight: 800, borderTop: '2px solid var(--borde)', fontVariantNumeric: 'tabular-nums' },
}
