'use client'

import { useEffect, useState } from 'react'
import { createClient, type Boleto, type Clase } from '@/lib/supabase'
import { getMiEmpresa, getViajesEmpresa } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { formatoHora, hoyHonduras } from '@/lib/fecha'
import { nombreTerminal } from '@/lib/terminales'
import SiteHeader from '@/components/SiteHeader'

// Shape returned by getViajesEmpresa
type ViajeEmpresa = {
  id: string
  salida: string
  clase: Clase
  capacidad: number
  asientos_disp: number
  rutas: { origen: { codigo: string } | null; destino: { codigo: string } | null }
  boletos: { id: string; nombre_pasajero: string; identidad_pas: string; estado: Boleto['estado']; codigo_qr: string; asientos: { numero: string } | null }[]
}

/**
 * /panel — website for bus company staff. Email + password login; only logins
 * listed in empresa_usuarios get in, and the database (RLS) only returns their
 * own company's trips and passengers (docs/panel-empresa.sql).
 */
export default function PanelPage() {
  const { t, locale } = useLang()
  const [verificando, setVerificando] = useState(true)
  const [logueado, setLogueado] = useState(false)
  const [empresa, setEmpresa] = useState<{ id: string; nombre: string } | null>(null)
  const [sinAcceso, setSinAcceso] = useState(false)
  const [errorCarga, setErrorCarga] = useState(false)
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [fecha, setFecha] = useState(hoyHonduras())
  const [viajes, setViajes] = useState<ViajeEmpresa[] | null>(null)

  async function cargarEmpresa() {
    // Only an empty answer means "not staff"; a failed request is shown as an error
    try {
      const fila = await getMiEmpresa()
      if (fila) setEmpresa({ id: fila.empresa_id, nombre: fila.empresas?.nombre ?? '' })
      else setSinAcceso(true)
    } catch {
      setErrorCarga(true)
    }
  }

  // Already signed in from an earlier visit?
  useEffect(() => {
    createClient().auth.getSession().then(async ({ data }) => {
      if (data.session) { setLogueado(true); await cargarEmpresa() }
      setVerificando(false)
    })
  }, [])

  useEffect(() => {
    if (!empresa) return
    let activo = true // drop answers for a date that is no longer selected
    setViajes(null)
    getViajesEmpresa(empresa.id, fecha)
      .then(data => { if (activo) setViajes(data as unknown as ViajeEmpresa[]) })
      .catch(() => { if (activo) setViajes([]) })
    return () => { activo = false }
  }, [empresa, fecha])

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password: contrasena })
    if (error) {
      setError(t.errorContrasena)
    } else {
      setLogueado(true)
      await cargarEmpresa()
    }
    setEnviando(false)
  }

  async function salir() {
    await createClient().auth.signOut()
    setLogueado(false); setEmpresa(null); setSinAcceso(false); setErrorCarga(false); setViajes(null); setContrasena('')
  }

  return (
    <main style={S.main}>
      <SiteHeader>
        {logueado && <button style={S.salir} onClick={salir}>{t.salir}</button>}
      </SiteHeader>

      {verificando ? null : !logueado ? (
        // ── Login ──
        <form onSubmit={entrar} style={S.card}>
          <h1 style={S.title}>{t.panelEmpresas}</h1>
          <p style={S.sub}>{t.panelSub}</p>
          <label htmlFor="email" style={S.label}>{t.correo}</label>
          <input id="email" type="email" required autoComplete="username" value={email}
            onChange={e => setEmail(e.target.value)} style={S.input} />
          <label htmlFor="contrasena" style={S.label}>{t.contrasena}</label>
          <input id="contrasena" type="password" required autoComplete="current-password" value={contrasena}
            onChange={e => setContrasena(e.target.value)} style={S.input} />
          <button className="sb-btn" style={{ ...S.btn, opacity: enviando ? .7 : 1 }} disabled={enviando}>
            {enviando ? t.verificando : t.entrar}
          </button>
          {error && <p role="alert" style={S.error}>{error}</p>}
        </form>
      ) : errorCarga ? (
        <div style={S.card}>
          <p style={S.error}>{t.errorViajes}</p>
          <p style={{ textAlign: 'center', marginTop: '.5rem' }}><a href="/panel" style={{ color: 'var(--turquesa)', textDecoration: 'underline' }}>{t.intentarDeNuevo}</a></p>
        </div>
      ) : sinAcceso ? (
        <div style={S.card}><p style={S.error}>{t.sinAcceso}</p></div>
      ) : empresa && (
        // ── Dashboard ──
        <div style={S.wrap}>
          <h1 style={S.title}>{empresa.nombre}</h1>
          <div style={S.barra}>
            <h2 style={{ fontSize: '1.4rem' }}>{t.viajesDelDia}</h2>
            <input type="date" aria-label={t.fecha} value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...S.input, width: 'auto', marginBottom: 0 }} />
          </div>

          {viajes === null ? (
            <p style={S.muted}>{t.cargando}</p>
          ) : viajes.length === 0 ? (
            <p style={S.muted}>{t.sinViajesDia}</p>
          ) : viajes.map(v => (
            <section key={v.id} style={S.viaje}>
              <div style={S.viajeFila}>
                <strong style={{ fontSize: '1.2rem' }}>{formatoHora(v.salida, locale)}</strong>
                <span>{nombreTerminal(v.rutas.origen?.codigo ?? '')} → {nombreTerminal(v.rutas.destino?.codigo ?? '')}</span>
                <span style={S.muted}>{t[v.clase]}</span>
                <span style={S.vendidos}>{t.vendidos(v.capacidad - v.asientos_disp, v.capacidad)}</span>
              </div>
              <details>
                <summary style={S.summary}>{t.pasajeros} ({v.boletos.length})</summary>
                {v.boletos.length === 0 ? (
                  <p style={S.muted}>{t.sinPasajeros}</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={S.tabla}>
                      <thead>
                        <tr><th style={S.th}>{t.asiento}</th><th style={S.th}>{t.pasajero}</th><th style={S.th}>{t.identidad}</th><th style={S.th}>{t.codigo}</th><th style={S.th} /></tr>
                      </thead>
                      <tbody>
                        {[...v.boletos].sort((a, b) => (a.asientos?.numero ?? '').localeCompare(b.asientos?.numero ?? '', undefined, { numeric: true })).map(b => (
                          <tr key={b.id}>
                            <td style={S.td}><strong>{b.asientos?.numero}</strong></td>
                            <td style={S.td}>{b.nombre_pasajero}</td>
                            <td style={S.td}>{b.identidad_pas}</td>
                            <td style={{ ...S.td, fontFamily: 'monospace' }}>{b.codigo_qr}</td>
                            <td style={S.td}>{t.estados[b.estado]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </details>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', position: 'relative', zIndex: 1 },
  card: { maxWidth: 420, margin: '4rem auto', padding: '2rem', background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12 },
  title: { fontSize: '2rem', marginBottom: '.5rem' },
  sub: { color: 'var(--tenue)', marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '.9rem', fontWeight: 500, color: 'var(--tenue)', marginBottom: 6 },
  input: { width: '100%', height: 46, padding: '0 13px', background: 'var(--hundido)', border: '1px solid var(--borde)', marginBottom: '1rem' },
  btn: { width: '100%', background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', padding: 13, fontWeight: 700, cursor: 'pointer' },
  error: { marginTop: '1rem', color: 'var(--rojo)', fontWeight: 700, textAlign: 'center' },
  salir: { background: 'none', border: 'none', color: 'var(--tinta)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' },
  wrap: { maxWidth: 960, margin: '2rem auto', padding: '0 1.5rem 4rem' },
  barra: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' },
  muted: { color: 'var(--tenue)' },
  viaje: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderLeft: '5px solid var(--guacamaya)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '.75rem' },
  viajeFila: { display: 'flex', alignItems: 'baseline', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '.5rem' },
  vendidos: { marginLeft: 'auto', fontWeight: 700 },
  summary: { cursor: 'pointer', color: 'var(--turquesa)', fontWeight: 500, marginBottom: '.5rem' },
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: '.95rem' },
  th: { textAlign: 'left', color: 'var(--tenue)', fontWeight: 500, padding: '6px 8px', borderBottom: '1px solid var(--borde)' },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--borde2)' },
}
