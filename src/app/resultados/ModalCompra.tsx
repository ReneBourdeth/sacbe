'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'
import { reservarAsientos } from '@/lib/api'
import { createClient, type Asiento, type Viaje } from '@/lib/supabase'
import { formatoFechaHora, formatoHora } from '@/lib/fecha'
import { CARGO_SERVICIO, totalConCargo } from '@/lib/precios'
import { nombreTerminal } from '@/lib/terminales'
import { qrComoImagen } from '@/lib/qr'
import { useAsientos } from './useAsientos'
import MapaAsientos from './MapaAsientos'
import { MarcaGuacamaya } from '@/components/Simbolos'
import { S } from './estilos'

// 1 seats → 2 passengers → 3 payment → 4 confirmation
type Paso = 1 | 2 | 3 | 4
type MetodoPago = 'tarjeta' | 'efectivo'
type Pasajero = { nombre: string; identidad: string; esMenor: boolean }
type BoletoListo = { numero: string; nombre: string; codigo: string; qr: string }

// Same limit the database enforces per person and trip
const MAX_ASIENTOS = 6
const VACIO: Pasajero = { nombre: '', identidad: '', esMenor: false }

type Props = {
  viaje: Viaje
  onCerrar: () => void
}

/**
 * Booking window for one trip: up to 6 seats in one purchase, one passenger per seat.
 * It owns all booking state, so closing it (which unmounts it) resets everything.
 */
export default function ModalCompra({ viaje, onCerrar }: Props) {
  const { t, locale } = useLang()
  const { asientos, cargado } = useAsientos(viaje.id)

  const [paso, setPaso] = useState<Paso>(1)
  const [elegidos, setElegidos] = useState<Asiento[]>([])
  const [pasajeros, setPasajeros] = useState<Record<string, Pasajero>>({}) // by seat id
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta')
  const [enviando, setEnviando] = useState(false)
  const [logueado, setLogueado] = useState(true) // assume yes until checked, to avoid a flash
  const [boletos, setBoletos] = useState<BoletoListo[]>([])

  // Logged-out users get a hint to sign in; the database refuses guest bookings
  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => setLogueado(!!data.session))
  }, [])

  const ruta = `${nombreTerminal(viaje.origen_codigo)} → ${nombreTerminal(viaje.destino_codigo)}`
  const total = elegidos.length * totalConCargo(viaje.precio)
  const pasajeroDe = (a: Asiento) => pasajeros[a.id] ?? VACIO
  const cambiar = (a: Asiento, cambio: Partial<Pasajero>) =>
    setPasajeros(p => ({ ...p, [a.id]: { ...pasajeroDe(a), ...cambio } }))

  // Click a seat to add it, click again to remove it; seats stay front-to-back ordered
  function alternar(a: Asiento) {
    if (elegidos.some(x => x.id === a.id)) return setElegidos(e => e.filter(x => x.id !== a.id))
    if (elegidos.length >= MAX_ASIENTOS) return alert(t.limiteAsientos)
    setElegidos(e => asientos.filter(x => x.id === a.id || e.some(y => y.id === x.id)))
  }

  function irAPasajeros() {
    if (elegidos.length === 0) return alert(t.alertAsiento)
    setPaso(2)
  }

  function irAPago() {
    if (!logueado) return alert(t.loginHint)
    if (elegidos.some(a => !pasajeroDe(a).nombre.trim() || !pasajeroDe(a).identidad.trim())) return alert(t.alertDatos)
    setPaso(3)
  }

  async function confirmarCompra() {
    setEnviando(true)
    try {
      const reservas = await reservarAsientos(viaje.id, elegidos.map(a => ({ asientoId: a.id, ...pasajeroDe(a) })))
      setBoletos(await Promise.all(reservas.map(async r => ({
        numero: elegidos.find(a => a.id === r.asientoId)?.numero ?? '',
        nombre: r.nombre,
        codigo: r.codigoQr,
        qr: await qrComoImagen(r.codigoQr, 150),
      }))))
      setPaso(4)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('ASIENTO_OCUPADO')) {
        // Someone took one of the seats meanwhile; nothing was booked, pick again
        alert(t.asientoOcupado)
        setElegidos([])
        setPaso(1)
      } else if (msg.includes('LIMITE_ASIENTOS')) {
        alert(t.limiteAsientos)
      } else if (msg.includes('LOGIN_REQUERIDO')) {
        alert(t.loginHint)
      } else {
        alert(t.errorCompra)
      }
    } finally {
      setEnviando(false)
    }
  }

  function compartirWhatsApp() {
    const lineas = boletos.map(b => `${t.asiento} ${b.numero} · ${b.nombre} · ${t.codigo}: ${b.codigo}`)
    const texto = `${t.whatsappMsg}\n${ruta}\n${formatoFechaHora(viaje.salida, locale)}\n${lineas.join('\n')}`
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

        {/* ── STEP 1: SEATS ── */}
        {paso === 1 && (
          <div>
            <div style={S.mEyebrow}>{t.paso(1)}</div>
            <div style={S.mTitle}>{t.seleccionaAsiento}</div>
            <div style={S.mSub}>
              {viaje.empresa} · {formatoHora(viaje.salida, locale)} · {t.hastaAsientos(MAX_ASIENTOS)}
            </div>
            <MapaAsientos asientos={asientos} cargado={cargado} seleccionados={elegidos} onSeleccionar={alternar} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
              <span style={{ color: 'var(--tenue)' }}>{elegidos.map(a => a.numero).join(', ')}</span>
              <button className="sb-btn" style={S.btnPagar} onClick={irAPasajeros}>{t.continuar}</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ONE PASSENGER PER SEAT ── */}
        {paso === 2 && (
          <div>
            <div style={S.mEyebrow}>{t.paso(2)}</div>
            <div style={S.mTitle}>{t.datosPasajero}</div>
            {!logueado && (
              <a href={`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`} style={S.loginHint}>
                {t.loginHint}
              </a>
            )}
            {elegidos.map(a => (
              <fieldset key={a.id} style={S.pasajeroCaja}>
                <legend style={S.pasajeroTitulo}>{t.asiento} {a.numero}</legend>
                <div className="sb-form2">
                  <div style={S.ff}>
                    <label style={S.ffLabel}>{t.nombreCompleto}</label>
                    <input style={S.ffInput} value={pasajeroDe(a).nombre} onChange={e => cambiar(a, { nombre: e.target.value })} placeholder="María García López" />
                  </div>
                  <div style={S.ff}>
                    <label style={S.ffLabel}>{t.identidad}</label>
                    <input style={S.ffInput} value={pasajeroDe(a).identidad} onChange={e => cambiar(a, { identidad: e.target.value })} placeholder="0801-1990-00000" />
                  </div>
                </div>
                <label style={{ ...S.checkRow, marginBottom: 0, marginTop: '.5rem' }}>
                  <input type="checkbox" checked={pasajeroDe(a).esMenor} onChange={e => cambiar(a, { esMenor: e.target.checked })} style={{ accentColor: 'var(--guacamaya)', width: 18, height: 18 }} />
                  <span>{t.esMenor}</span>
                </label>
              </fieldset>
            ))}
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
              <div style={S.resLine}><span>{t.boletosPor(elegidos.length, viaje.precio)}</span><strong>L. {elegidos.length * viaje.precio}</strong></div>
              <div style={S.resLine}><span>{t.cargoPorServicio} × {elegidos.length}</span><strong>L. {elegidos.length * CARGO_SERVICIO}</strong></div>
              <div style={S.resTotal}><span>{t.total}</span><span>L. {total}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button style={S.btnBack} onClick={() => setPaso(2)}>{t.atras}</button>
              <button className="sb-btn" style={{ ...S.btnPagar, flex: 1, opacity: enviando ? .7 : 1 }} onClick={confirmarCompra} disabled={enviando}>
                {enviando ? t.procesando : t.confirmarPagar}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: CONFIRMATION, one QR per ticket ── */}
        {paso === 4 && boletos.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={S.confIcono}><MarcaGuacamaya size={56} /></div>
            {/* Cash: tickets stay "reservado" until the bus company confirms payment in /panel */}
            <div style={S.confTitulo}>{metodo === 'efectivo' ? t.reservaPendiente : t.boletoConfirmado}</div>
            <p style={S.confSub}>{metodo === 'efectivo' ? t.pagaEnPagoExpress(total) : t.caminoBlanco}</p>
            <p style={{ ...S.confSub, marginTop: '-.75rem' }}>{viaje.empresa} · {ruta} · {formatoFechaHora(viaje.salida, locale)}</p>

            {boletos.map(b => (
              <div key={b.codigo} style={S.boletoListo}>
                <div style={{ background: 'white', padding: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL, nothing to optimize */}
                  <img src={b.qr} alt={`QR ${t.asiento} ${b.numero}`} style={{ display: 'block', width: 120, height: 120 }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.asiento} {b.numero}</div>
                  <div>{b.nombre}</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--tenue)' }}>{b.codigo}</div>
                </div>
              </div>
            ))}

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
