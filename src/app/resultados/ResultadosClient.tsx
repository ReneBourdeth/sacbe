'use client'

import { useState, useEffect } from 'react'
import { createClient, type Viaje, type Asiento } from '@/lib/supabase'
import QRCode from 'qrcode'
import { subscribeAsientos, reservarAsiento } from '@/lib/api'
import { useLang, LangToggle } from '@/lib/i18n'

// Always show times in Honduras time, whatever the viewer's timezone
const TZ = 'America/Tegucigalpa'

const NOM: Record<string, string> = {
  SPS: 'San Pedro Sula', TGU: 'Tegucigalpa', CEI: 'La Ceiba',
  CMG: 'Comayagua', CHO: 'Choluteca', CPN: 'Copán Ruinas', ROA: 'Roatán',
}

interface Props {
  viajes: Viaje[]
  origen: string
  destino: string
  fecha: string
}

type Paso = 1 | 2 | 3 | 4

export default function ResultadosClient({ viajes, origen, destino, fecha }: Props) {
  const [viaje,    setViaje]    = useState<Viaje | null>(null)
  const [asientos, setAsientos] = useState<Asiento[]>([])
  const [asientoSel, setAsientoSel] = useState<Asiento | null>(null)
  const [paso,     setPaso]     = useState<Paso>(1)
  const [modal,    setModal]    = useState(false)
  const [filtro,   setFiltro]   = useState('todos')
  const [loading,  setLoading]  = useState(false)
  const [codigoQR, setCodigoQR] = useState('')
  const [asientosCargados, setAsientosCargados] = useState(false)
  const [qrImg, setQrImg] = useState('')
  const { t, locale } = useLang()
  const hora = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: TZ })

  // Passenger form
  const [nombre,   setNombre]   = useState('')
  const [identidad, setIdentidad] = useState('')
  const [esMenor,  setEsMenor]  = useState(false)
  const [metodo,   setMetodo]   = useState<'tarjeta' | 'efectivo'>('tarjeta')

  // Load seats when trip is selected
  useEffect(() => {
    if (!viaje) return
    const supabase = createClient()
    setAsientosCargados(false)
    supabase.from('asientos').select('*').eq('viaje_id', viaje.id).then(({ data }) => {
      setAsientos(data || [])
      setAsientosCargados(true)
    })
    // Subscribe to realtime seat changes
    const channel = subscribeAsientos(viaje.id, setAsientos)
    return () => { supabase.removeChannel(channel) }
  }, [viaje])

  function selViaje(v: Viaje) {
    setViaje(v)
    setAsientoSel(null)
  }

  function abrirModal() {
    if (!viaje) return
    setModal(true)
    setPaso(1)
  }

  function cerrarModal() {
    setModal(false)
    setAsientoSel(null)
    setPaso(1)
  }

  async function confirmarCompra() {
    if (!viaje || !asientoSel || !nombre || !identidad) return
    setLoading(true)
    try {
      const { codigoQr } = await reservarAsiento(viaje.id, asientoSel.id, { nombre, identidad, esMenor })
      setCodigoQR(codigoQr)
      setQrImg(await QRCode.toDataURL(codigoQr, { width: 180, margin: 0, color: { dark: '#0C0B09', light: '#FFFFFF' } }))
      setPaso(4)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('ASIENTO_OCUPADO')) {
        alert(t.asientoOcupado)
        setAsientoSel(null)
        setPaso(1)
      } else {
        alert(t.errorCompra)
      }
    } finally {
      setLoading(false)
    }
  }

  const viajesFiltrados = filtro === 'todos' ? viajes
    : filtro === 'directo' ? viajes.filter(v => true) // add directo field to schema
    : viajes.filter(v => v.clase === filtro)

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* ── HEADER ── */}
      <header style={S.header}>
        <a href="/" style={S.logo}>SAC<span style={{ color: 'var(--dorado)' }}>BÉ</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" style={S.back}>{t.cambiarBusqueda}</a>
          <LangToggle />
        </div>
      </header>

      {/* ── SUBHEADER ── */}
      <div style={S.subhead}>
        <span style={S.shRuta}>{NOM[origen]} — {NOM[destino]}</span>
        <span style={S.shFecha}>{new Date(fecha + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <a href="/" style={S.shEdit}>{t.editar}</a>
      </div>

      {/* ── LAYOUT ── */}
      <div style={S.layout}>
        {/* LIST */}
        <div>
          {/* Filter chips */}
          <div style={S.chips}>
            {['todos', 'economica', 'ejecutivo', 'primera'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                style={{ ...S.chip, ...(filtro === f ? S.chipOn : {}) }}>
                {t[f as 'todos' | 'economica' | 'ejecutivo' | 'primera']}
              </button>
            ))}
          </div>

          {/* Trip cards */}
          {viajesFiltrados.length === 0 ? (
            <div style={S.noResults}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', marginBottom: '.5rem' }}>{t.sinResultados}</div>
              <p style={{ color: 'var(--blanco3)', fontSize: '.85rem', fontWeight: 300 }}>{t.otraFecha}</p>
            </div>
          ) : viajesFiltrados.map(v => (
            <div key={v.id} onClick={() => selViaje(v)}
              style={{ ...S.tripCard, ...(viaje?.id === v.id ? S.tripSel : {}) }}>
              <div>
                <div style={S.tripEmp}>{v.empresa}</div>
                <div style={S.tripClase}>
                  <span style={{ ...S.dot, background: v.clase === 'ejecutivo' ? 'var(--dorado)' : v.clase === 'primera' ? '#a78bfa' : 'var(--dorado3)' }} />
                  {t[v.clase]}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={S.hora}>{hora(v.salida)}</div>
                <div style={S.ciudadLabel}>{NOM[origen]}</div>
              </div>
              <div style={S.rutaMid}>
                <span style={S.duracion}>{Math.floor(v.duracion_min / 60)}h {v.duracion_min % 60 ? v.duracion_min % 60 + 'm' : ''}</span>
                <div style={S.rutaLine} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={S.hora}>{hora(v.llegada_est)}</div>
                <div style={S.ciudadLabel}>{NOM[destino]}</div>
              </div>
              <div style={S.precioCol}>
                <div style={S.precio}>L. {v.precio}</div>
                <div style={{ fontSize: '.68rem', color: v.asientos_disp <= 5 ? 'var(--rojo)' : 'var(--dorado3)' }}>
                  {v.asientos_disp <= 5 ? t.asientosPocos(v.asientos_disp) : t.asientosDisp(v.asientos_disp)}
                </div>
                <button style={{ ...S.btnSel, ...(viaje?.id === v.id ? S.btnSelOn : {}) }}
                  onClick={e => { e.stopPropagation(); selViaje(v) }}>
                  {viaje?.id === v.id ? t.elegido : t.elegir}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div>
          <div style={S.sideCard}>
            <div style={S.sideLabel}>{t.tuSeleccion}</div>
            {!viaje ? (
              <p style={{ color: 'var(--blanco3)', fontSize: '.82rem', fontWeight: 300, textAlign: 'center', padding: '1rem 0' }}>
                {t.seleccionaViaje}
              </p>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 3 }}>{viaje.empresa}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 300, color: 'var(--blanco3)', marginBottom: 12 }}>
                  {hora(viaje.salida)} → {hora(viaje.llegada_est)}
                </div>
                <div style={S.sbLine}><span>{t.boleto}</span><strong>L. {viaje.precio}</strong></div>
                <div style={S.sbLine}><span>{t.cargoServicio}</span><strong>L. 15</strong></div>
                <div style={S.sbTotal}><span>{t.total}</span><span>L. {viaje.precio + 15}</span></div>
                <button style={S.btnComprar} onClick={abrirModal}>{t.comprarBoleto}</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div style={S.overlay} onClick={cerrarModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <button style={S.modalX} onClick={cerrarModal}>✕</button>

            {/* Step bar */}
            <div style={S.stepBar}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ ...S.stepDot, ...(n <= paso ? S.stepDotOn : {}) }} />
              ))}
            </div>

            {/* PASO 1 — ASIENTO */}
            {paso === 1 && (
              <div>
                <div style={S.mEyebrow}>{t.paso(1)}</div>
                <div style={S.mTitle}>{t.seleccionaAsiento}</div>
                <div style={S.mSub}>{viaje?.empresa} · {viaje && hora(viaje.salida)}</div>
                <div style={S.busShell}>
                  <div style={S.busFront}><span style={{ fontSize: '.55rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--negro)', fontWeight: 500 }}>{t.frente}</span></div>
                  <div style={S.busGrid}>
                    {asientos.length === 0
                      ? <p style={{ color: 'var(--blanco3)', fontSize: '.8rem', gridColumn: '1/-1', textAlign: 'center' }}>{asientosCargados ? t.sinAsientos : t.cargandoAsientos}</p>
                      : (() => {
                          const rows: React.ReactNode[] = []
                          const sorted = [...asientos].sort((a, b) => a.fila - b.fila || a.columna.localeCompare(b.columna))
                          let i = 0
                          while (i < sorted.length) {
                            const seat = sorted[i]
                            rows.push(
                              <div key={seat.id}
                                style={{
                                  ...S.seat,
                                  ...(seat.estado !== 'disponible' ? S.seatOcu : {}),
                                  ...(asientoSel?.id === seat.id ? S.seatSel : {}),
                                }}
                                onClick={() => seat.estado === 'disponible' && setAsientoSel(seat)}>
                                {seat.numero}
                              </div>
                            )
                            // Add aisle after column B (every 2 seats)
                            if (seat.columna === 'B') rows.push(<div key={`p-${i}`} style={{ ...S.seat, background: 'transparent', border: 'none', cursor: 'default' }} />)
                            i++
                          }
                          return rows
                        })()
                    }
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                  <button style={S.btnPagar} onClick={() => { if (!asientoSel) { alert(t.alertAsiento); return } setPaso(2) }}>{t.continuar}</button>
                </div>
              </div>
            )}

            {/* PASO 2 — PASAJERO */}
            {paso === 2 && (
              <div>
                <div style={S.mEyebrow}>{t.paso(2)}</div>
                <div style={S.mTitle}>{t.datosPasajero}</div>
                <div style={S.mSub}>{t.asiento}: <strong style={{ color: 'var(--dorado)' }}>{asientoSel?.numero}</strong></div>
                <label style={S.checkRow}>
                  <input type="checkbox" checked={esMenor} onChange={e => setEsMenor(e.target.checked)} style={{ accentColor: 'var(--dorado)', width: 16, height: 16 }} />
                  <span style={{ fontSize: '.82rem', fontWeight: 300, color: 'var(--blanco3)' }}>{t.esMenor}</span>
                </label>
                <div style={S.formGrid}>
                  <div style={{ ...S.ff, gridColumn: '1/-1' }}>
                    <label style={S.ffLabel}>{t.nombreCompleto}</label>
                    <input style={S.ffInput} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María García López" />
                  </div>
                  <div style={S.ff}>
                    <label style={S.ffLabel}>{t.identidad}</label>
                    <input style={S.ffInput} value={identidad} onChange={e => setIdentidad(e.target.value)} placeholder="0801-1990-00000" />
                  </div>
                  <div style={S.ff}>
                    <label style={S.ffLabel}>{t.telefono}</label>
                    <input style={S.ffInput} type="tel" placeholder="9999-9999" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                  <button style={S.btnBack} onClick={() => setPaso(1)}>{t.atras}</button>
                  <button style={{ ...S.btnPagar, flex: 1 }} onClick={() => { if (!nombre || !identidad) { alert(t.alertDatos); return } setPaso(3) }}>{t.continuar}</button>
                </div>
              </div>
            )}

            {/* PASO 3 — PAGO */}
            {paso === 3 && (
              <div>
                <div style={S.mEyebrow}>{t.paso(3)}</div>
                <div style={S.mTitle}>{t.metodoPago}</div>
                <div style={S.metodos}>
                  {(['tarjeta', 'efectivo'] as const).map(m => (
                    <button key={m} style={{ ...S.metodo, ...(metodo === m ? S.metodoOn : {}) }} onClick={() => setMetodo(m)}>
                      <div>{m === 'tarjeta' ? '💳' : '💵'}</div>
                      <div style={{ fontSize: '.68rem', letterSpacing: 1, textTransform: 'uppercase', color: metodo === m ? 'var(--dorado)' : 'var(--blanco3)' }}>
                        {m === 'tarjeta' ? t.tarjeta : t.efectivo}
                      </div>
                    </button>
                  ))}
                </div>
                {metodo === 'tarjeta' && (
                  <div style={S.cardFields}>
                    <div style={{ ...S.ff, gridColumn: '1/-1' }}>
                      <label style={S.ffLabel}>{t.numTarjeta}</label>
                      <input style={S.ffInput} placeholder="4242 4242 4242 4242" maxLength={19} />
                    </div>
                    <div style={S.ff}><label style={S.ffLabel}>{t.vencimiento}</label><input style={S.ffInput} placeholder={t.vencPlaceholder} maxLength={5} /></div>
                    <div style={S.ff}><label style={S.ffLabel}>CVV</label><input style={S.ffInput} placeholder="123" maxLength={3} /></div>
                  </div>
                )}
                {metodo === 'efectivo' && (
                  <div style={{ background: 'var(--negro4)', border: '1px solid var(--borde2)', padding: '1rem', fontSize: '.82rem', fontWeight: 300, color: 'var(--blanco3)', marginTop: '.875rem' }}>
                    {t.efectivoInfoA} <strong style={{ color: 'var(--blanco)' }}>PagoExpress</strong>.
                  </div>
                )}
                <div style={S.resumenBox}>
                  <div style={S.resLine}><span>{t.boletoAsiento(asientoSel?.numero || '')}</span><strong>L. {viaje?.precio}</strong></div>
                  <div style={S.resLine}><span>{t.cargoPorServicio}</span><strong>L. 15</strong></div>
                  <div style={S.resTotal}><span>{t.total}</span><span>L. {(viaje?.precio || 0) + 15}</span></div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <button style={S.btnBack} onClick={() => setPaso(2)}>{t.atras}</button>
                  <button style={{ ...S.btnPagar, flex: 1, opacity: loading ? .7 : 1 }} onClick={confirmarCompra} disabled={loading}>
                    {loading ? t.procesando : t.confirmarPagar}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4 — CONFIRMACIÓN */}
            {paso === 4 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', color: 'var(--dorado)', marginBottom: '1rem' }}>✦</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '.5rem' }}>{t.boletoConfirmado}</div>
                <p style={{ fontSize: '.85rem', fontWeight: 300, color: 'var(--blanco3)', marginBottom: '1.5rem' }}>{t.caminoBlanco}</p>
                <div style={{ background: 'white', padding: 12, display: 'inline-block', marginBottom: '1rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL, nothing to optimize */}
                  <img src={qrImg} alt="QR" style={{ display: 'block', width: 180, height: 180 }} />
                </div>
                <div style={{ background: 'var(--negro4)', border: '1px solid var(--borde2)', padding: '1rem', textAlign: 'left', marginBottom: '1rem' }}>
                  {[
                    [t.empresa, viaje?.empresa],
                    [t.ruta, `${NOM[origen]} → ${NOM[destino]}`],
                    [t.salida, viaje && new Date(viaje.salida).toLocaleString(locale, { timeZone: TZ })],
                    [t.asiento, asientoSel?.numero],
                    [t.pasajero, nombre],
                    [t.codigo, codigoQR],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--blanco3)', fontWeight: 300 }}>{k}</span>
                      <span style={k === t.asiento ? { color: 'var(--dorado)' } : {}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button style={{ ...S.btnPagar, marginBottom: '.5rem', background: '#25D366' }}
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${t.whatsappMsg}\n${NOM[origen]} → ${NOM[destino]}\n${t.asiento}: ${asientoSel?.numero}\n${t.codigo}: ${codigoQR}`)}`,'_blank')}>
                  {t.whatsapp}
                </button>
                <button style={{ ...S.btnPagar, background: 'transparent', border: '1px solid var(--borde)', color: 'var(--blanco3)' }}
                  onClick={() => location.href = '/mis-viajes'}>
                  {t.verBoletos}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  header: { background: 'rgba(12,11,9,.9)', borderBottom: '1px solid var(--borde)', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(20px)' },
  logo: { fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blanco)' },
  back: { fontSize: '.68rem', letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--blanco3)', textDecoration: 'none' },
  subhead: { background: 'var(--negro2)', borderBottom: '1px solid var(--borde2)', padding: '.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  shRuta: { fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 600 },
  shFecha: { fontSize: '.68rem', letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--dorado)', background: 'rgba(201,168,76,.08)', border: '1px solid var(--borde)', padding: '3px 12px' },
  shEdit: { fontSize: '.68rem', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blanco3)', textDecoration: 'underline', marginLeft: 'auto', cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', maxWidth: 1060, margin: '1.5rem auto', padding: '0 1.5rem 4rem' },
  chips: { display: 'flex', gap: '.375rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  chip: { padding: '5px 14px', border: '1px solid var(--borde2)', background: 'transparent', fontSize: '.65rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', color: 'var(--blanco3)' },
  chipOn: { borderColor: 'var(--dorado)', color: 'var(--dorado)', background: 'rgba(201,168,76,.06)' },
  tripCard: { background: 'var(--negro2)', border: '1px solid var(--borde2)', padding: '1.25rem 1.375rem', display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginBottom: '.875rem' },
  tripSel: { borderColor: 'var(--dorado)' },
  tripEmp: { fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 3 },
  tripClase: { fontSize: '.68rem', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blanco3)', display: 'flex', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block' },
  hora: { fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1 },
  ciudadLabel: { fontSize: '.65rem', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blanco3)', marginTop: 2 },
  rutaMid: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0 .5rem' },
  duracion: { fontSize: '.65rem', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blanco3)' },
  rutaLine: { width: 70, height: 1, background: 'var(--borde2)' },
  precioCol: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  precio: { fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--dorado)', lineHeight: 1 },
  btnSel: { background: 'var(--dorado)', color: 'var(--negro)', border: 'none', padding: '8px 18px', fontSize: '.65rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnSelOn: { background: 'var(--negro3)', color: 'var(--blanco3)', border: '1px solid var(--borde2)' },
  noResults: { background: 'var(--negro2)', border: '1px solid var(--borde2)', padding: '3rem', textAlign: 'center' },
  sideCard: { background: 'var(--negro2)', border: '1px solid var(--borde2)', padding: '1.25rem' },
  sideLabel: { fontSize: '.62rem', letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--dorado)', marginBottom: '1rem' },
  sbLine: { display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 5, color: 'var(--blanco3)' },
  sbTotal: { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 600, paddingTop: 10, marginTop: 8, borderTop: '1px solid var(--borde2)', color: 'var(--dorado)' },
  btnComprar: { width: '100%', background: 'var(--dorado)', color: 'var(--negro)', border: 'none', padding: 12, fontSize: '.68rem', letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', marginTop: '1rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' },
  modal: { background: 'var(--negro3)', border: '1px solid var(--borde)', width: '100%', maxWidth: 580, maxHeight: '95vh', overflowY: 'auto', padding: '2rem', position: 'relative' },
  modalX: { position: 'absolute', top: '.875rem', right: '.875rem', width: 28, height: 28, border: '1px solid var(--borde2)', background: 'transparent', cursor: 'pointer', color: 'var(--blanco3)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepBar: { display: 'flex', gap: 3, marginBottom: '1.5rem' },
  stepDot: { flex: 1, height: 2, background: 'var(--borde2)' },
  stepDotOn: { background: 'var(--dorado)' },
  mEyebrow: { fontSize: '.62rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--dorado)', marginBottom: '.5rem' },
  mTitle: { fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '.25rem' },
  mSub: { fontSize: '.82rem', fontWeight: 300, color: 'var(--blanco3)', marginBottom: '1.25rem' },
  busShell: { background: 'var(--negro4)', border: '1px solid var(--borde2)', padding: '1.25rem', marginBottom: '1.25rem' },
  busFront: { width: 50, height: 22, background: 'var(--dorado)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  busGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5, maxWidth: 228, margin: '0 auto' },
  seat: { width: 38, height: 38, border: '1px solid var(--borde2)', background: 'var(--negro3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: 'var(--blanco3)' },
  seatSel: { borderColor: 'var(--dorado)', background: 'var(--dorado)', color: 'var(--negro)', fontWeight: 600 },
  seatOcu: { background: 'var(--negro4)', color: 'rgba(245,240,232,.1)', cursor: 'not-allowed' },
  checkRow: { display: 'flex', alignItems: 'center', gap: 9, padding: '.75rem', background: 'var(--negro4)', border: '1px solid var(--borde2)', cursor: 'pointer', marginBottom: '.875rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' },
  ff: { display: 'flex', flexDirection: 'column', gap: 5 },
  ffLabel: { fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dorado)' },
  ffInput: { padding: '9px 12px', background: 'var(--negro4)', border: '1px solid var(--borde2)', color: 'var(--blanco)', fontSize: '.875rem', fontWeight: 300, outline: 'none' },
  metodos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.625rem', marginBottom: '1rem' },
  metodo: { padding: '.875rem', border: '1px solid var(--borde2)', background: 'transparent', cursor: 'pointer', textAlign: 'center', fontSize: '1.1rem' },
  metodoOn: { borderColor: 'var(--dorado)', background: 'rgba(201,168,76,.06)' },
  cardFields: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginTop: '.875rem' },
  resumenBox: { background: 'var(--negro4)', border: '1px solid var(--borde2)', padding: '1rem', margin: '1rem 0' },
  resLine: { display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 5, color: 'var(--blanco3)' },
  resTotal: { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 600, paddingTop: 10, marginTop: 8, borderTop: '1px solid var(--borde2)', color: 'var(--dorado)' },
  btnPagar: { width: '100%', background: 'var(--dorado)', color: 'var(--negro)', border: 'none', padding: 13, fontSize: '.7rem', letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' },
  btnBack: { background: 'transparent', border: '1px solid var(--borde2)', color: 'var(--blanco3)', padding: '11px 18px', fontSize: '.65rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' },
}
