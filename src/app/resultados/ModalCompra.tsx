'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'
import { reservarAsiento } from '@/lib/api'
import { createClient, type Asiento, type Viaje } from '@/lib/supabase'
import { formatoFechaHora, formatoHora } from '@/lib/fecha'
import { CARGO_SERVICIO, totalConCargo } from '@/lib/precios'
import { nombreTerminal } from '@/lib/terminales'
import { qrComoImagen } from '@/lib/qr'
import { useAsientos } from './useAsientos'
import MapaAsientos from './MapaAsientos'
import { MarcaGuacamaya } from '@/components/Simbolos'
import { S } from './estilos'

// 1 seat → 2 passenger → 3 payment → 4 confirmation
type Paso = 1 | 2 | 3 | 4
type MetodoPago = 'tarjeta' | 'efectivo'

type Props = {
  viaje: Viaje
  onCerrar: () => void
}

/**
 * Booking window for one trip. It owns all booking state, so closing it
 * (which unmounts it) automatically resets everything for the next time.
 */
export default function ModalCompra({ viaje, onCerrar }: Props) {
  const { t, locale } = useLang()
  const { asientos, cargado } = useAsientos(viaje.id)

  const [paso, setPaso] = useState<Paso>(1)
  const [asiento, setAsiento] = useState<Asiento | null>(null)
  const [nombre, setNombre] = useState('')
  const [identidad, setIdentidad] = useState('')
  const [esMenor, setEsMenor] = useState(false)
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta')
  const [enviando, setEnviando] = useState(false)
  const [logueado, setLogueado] = useState(true) // assume yes until checked, to avoid a flash
  const [boleto, setBoleto] = useState<{ codigo: string; qr: string } | null>(null)

  // Logged-out users get a hint to sign in, so the ticket is saved to their account
  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => setLogueado(!!data.session))
  }, [])

  const ruta = `${nombreTerminal(viaje.origen_codigo)} → ${nombreTerminal(viaje.destino_codigo)}`

  function irAPasajero() {
    if (!asiento) return alert(t.alertAsiento)
    setPaso(2)
  }

  function irAPago() {
    if (!nombre.trim() || !identidad.trim()) return alert(t.alertDatos)
    setPaso(3)
  }

  async function confirmarCompra() {
    if (!asiento) return
    setEnviando(true)
    try {
      const { codigoQr } = await reservarAsiento(viaje.id, asiento.id, { nombre, identidad, esMenor })
      setBoleto({ codigo: codigoQr, qr: await qrComoImagen(codigoQr) })
      setPaso(4)
    } catch (e) {
      // Someone else booked the seat while this user was filling in the form
      if (e instanceof Error && e.message.includes('ASIENTO_OCUPADO')) {
        alert(t.asientoOcupado)
        setAsiento(null)
        setPaso(1)
      } else {
        alert(t.errorCompra)
      }
    } finally {
      setEnviando(false)
    }
  }

  function compartirWhatsApp() {
    if (!boleto || !asiento) return
    const texto = `${t.whatsappMsg}\n${ruta}\n${t.asiento}: ${asiento.numero}\n${t.codigo}: ${boleto.codigo}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    // Clicking the dark background closes the window; clicks inside don't
    <div className="sb-overlay" style={S.overlay} onClick={onCerrar}>
      <div className="sb-modal" role="dialog" aria-modal style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.modalX} onClick={onCerrar} aria-label={t.cerrar}>✕</button>

        {/* Progress bar */}
        <div style={S.stepBar}>
          {[1, 2, 3, 4].map(n => <div key={n} style={{ ...S.stepDot, ...(n <= paso ? S.stepDotOn : {}) }} />)}
        </div>

        {/* ── STEP 1: SEAT ── */}
        {paso === 1 && (
          <div>
            <div style={S.mEyebrow}>{t.paso(1)}</div>
            <div style={S.mTitle}>{t.seleccionaAsiento}</div>
            <div style={S.mSub}>{viaje.empresa} · {formatoHora(viaje.salida, locale)}</div>
            <MapaAsientos asientos={asientos} cargado={cargado} seleccionado={asiento} onSeleccionar={setAsiento} />
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button className="sb-btn" style={S.btnPagar} onClick={irAPasajero}>{t.continuar}</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PASSENGER ── */}
        {paso === 2 && (
          <div>
            <div style={S.mEyebrow}>{t.paso(2)}</div>
            <div style={S.mTitle}>{t.datosPasajero}</div>
            <div style={S.mSub}>{t.asiento}: <strong>{asiento?.numero}</strong></div>
            {!logueado && (
              <a href={`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`} style={S.loginHint}>
                {t.loginHint}
              </a>
            )}
            <label style={S.checkRow}>
              <input type="checkbox" checked={esMenor} onChange={e => setEsMenor(e.target.checked)} style={{ accentColor: 'var(--guacamaya)', width: 18, height: 18 }} />
              <span>{t.esMenor}</span>
            </label>
            <div className="sb-form2">
              <div style={{ ...S.ff, gridColumn: '1/-1' }}>
                <label style={S.ffLabel}>{t.nombreCompleto}</label>
                <input style={S.ffInput} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María García López" autoComplete="name" />
              </div>
              <div style={S.ff}>
                <label style={S.ffLabel}>{t.identidad}</label>
                <input style={S.ffInput} value={identidad} onChange={e => setIdentidad(e.target.value)} placeholder="0801-1990-00000" />
              </div>
              <div style={S.ff}>
                {/* TODO (Sprint 2): save the phone number to send ticket reminders */}
                <label style={S.ffLabel}>{t.telefono}</label>
                <input style={S.ffInput} type="tel" placeholder="9999-9999" autoComplete="tel" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
              <button style={S.btnBack} onClick={() => setPaso(1)}>{t.atras}</button>
              <button className="sb-btn" style={{ ...S.btnPagar, flex: 1 }} onClick={irAPago}>{t.continuar}</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PAYMENT ── */}
        {paso === 3 && (
          <div>
            <div style={S.mEyebrow}>{t.paso(3)}</div>
            <div style={S.mTitle}>{t.metodoPago}</div>
            <div style={S.metodos}>
              {(['tarjeta', 'efectivo'] as const).map(m => (
                <button key={m} style={{ ...S.metodo, ...(metodo === m ? S.metodoOn : {}) }} onClick={() => setMetodo(m)}>
                  <div>{m === 'tarjeta' ? '💳' : '💵'}</div>
                  <div style={{ fontSize: '.95rem', fontWeight: 500, color: 'var(--tinta)' }}>
                    {m === 'tarjeta' ? t.tarjeta : t.efectivo}
                  </div>
                </button>
              ))}
            </div>

            {/* TODO (Sprint 2): replace these demo fields with Stripe's secure card form.
                Card numbers must never pass through our own code. */}
            {metodo === 'tarjeta' && (
              <div className="sb-form2" style={S.cardFields}>
                <div style={{ ...S.ff, gridColumn: '1/-1' }}>
                  <label style={S.ffLabel}>{t.numTarjeta}</label>
                  <input style={S.ffInput} placeholder="4242 4242 4242 4242" maxLength={19} />
                </div>
                <div style={S.ff}><label style={S.ffLabel}>{t.vencimiento}</label><input style={S.ffInput} placeholder={t.vencPlaceholder} maxLength={5} /></div>
                <div style={S.ff}><label style={S.ffLabel}>CVV</label><input style={S.ffInput} placeholder="123" maxLength={3} /></div>
              </div>
            )}
            {metodo === 'efectivo' && (
              <div style={S.infoEfectivo}>
                {t.efectivoInfoA} <strong style={{ color: 'var(--tinta)' }}>PagoExpress</strong>.
              </div>
            )}

            <div style={S.resumenBox}>
              <div style={S.resLine}><span>{t.boletoAsiento(asiento?.numero ?? '')}</span><strong>L. {viaje.precio}</strong></div>
              <div style={S.resLine}><span>{t.cargoPorServicio}</span><strong>L. {CARGO_SERVICIO}</strong></div>
              <div style={S.resTotal}><span>{t.total}</span><span>L. {totalConCargo(viaje.precio)}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button style={S.btnBack} onClick={() => setPaso(2)}>{t.atras}</button>
              <button className="sb-btn" style={{ ...S.btnPagar, flex: 1, opacity: enviando ? .7 : 1 }} onClick={confirmarCompra} disabled={enviando}>
                {enviando ? t.procesando : t.confirmarPagar}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: CONFIRMATION ── */}
        {paso === 4 && boleto && (
          <div style={{ textAlign: 'center' }}>
            <div style={S.confIcono}><MarcaGuacamaya size={56} /></div>
            <div style={S.confTitulo}>{t.boletoConfirmado}</div>
            <p style={S.confSub}>{t.caminoBlanco}</p>
            <div style={{ background: 'white', padding: 12, display: 'inline-block', marginBottom: '1rem', border: '1px solid var(--borde)', borderRadius: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL, nothing to optimize */}
              <img src={boleto.qr} alt="QR" style={{ display: 'block', width: 180, height: 180 }} />
            </div>
            <div style={S.confDatos}>
              {[
                [t.empresa, viaje.empresa],
                [t.ruta, ruta],
                [t.salida, formatoFechaHora(viaje.salida, locale)],
                [t.asiento, asiento?.numero],
                [t.pasajero, nombre],
                [t.codigo, boleto.codigo],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} style={S.confFila}>
                  <span style={{ color: 'var(--tenue)' }}>{etiqueta}</span>
                  <span style={etiqueta === t.asiento ? { fontWeight: 700 } : {}}>{valor}</span>
                </div>
              ))}
            </div>
            <button style={{ ...S.btnPagar, marginBottom: '.5rem', background: '#25D366', color: '#000000' }} onClick={compartirWhatsApp}>
              {t.whatsapp}
            </button>
            <a href="/mis-viajes" style={{ ...S.btnPagar, ...S.btnSecundario }}>{t.verBoletos}</a>
          </div>
        )}
      </div>
    </div>
  )
}
