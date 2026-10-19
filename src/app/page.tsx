'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { hoyHonduras } from '@/lib/fecha'
import { TERMINALES } from '@/lib/terminales'
import AuthLink from '@/components/AuthLink'
import LangToggle from '@/components/LangToggle'
import { Logo } from '@/components/SiteHeader'
import { EstampaCopan } from '@/components/Simbolos'

/** Home: hero text and illustration, then the trip search (from, to, date). */
export default function HomePage() {
  const router = useRouter()
  const { t } = useLang()
  const hoy = hoyHonduras()
  const [origen, setOrigen] = useState('SPS')
  const [destino, setDestino] = useState('TGU')
  const [fecha, setFecha] = useState(hoy)

  function intercambiar() {
    setOrigen(destino)
    setDestino(origen)
  }

  function buscar() {
    if (origen === destino) return alert(t.origenDestinoIguales)
    const params = new URLSearchParams({ origen, destino, fecha })
    router.push(`/resultados?${params}`)
  }

  return (
    <main style={S.main}>
      <div className="sb-plumas" />
      <div style={S.barra}>
        <Logo />
        <div style={S.esquina}>
          <AuthLink />
          <LangToggle />
        </div>
      </div>

      <div className="sb-home" style={S.contenido}>
        <div className="sb-hero">
          <div>
            <p style={S.tagline}>{t.tagline}</p>
            <h1 style={S.titulo}>{t.heroA}</h1>
            <p style={S.sub}>{t.heroB}</p>
          </div>
          <EstampaCopan etiqueta={t.ilustracion} />
        </div>

        <div className="sb-search-box" style={S.caja}>
          {/* The order of these 5 children matters: globals.css stacks them on phones */}
          <div className="sb-search">
            <div style={S.campo}>
              <label htmlFor="origen" style={S.label}>{t.origen}</label>
              <select id="origen" value={origen} onChange={e => setOrigen(e.target.value)} style={S.input}>
                {TERMINALES.map(term => <option key={term.codigo} value={term.codigo}>{term.nombre}</option>)}
              </select>
            </div>

            <button onClick={intercambiar} style={S.intercambiar} aria-label={t.intercambiar}>⇄</button>

            <div style={S.campo}>
              <label htmlFor="destino" style={S.label}>{t.destino}</label>
              <select id="destino" value={destino} onChange={e => setDestino(e.target.value)} style={S.input}>
                {TERMINALES.map(term => <option key={term.codigo} value={term.codigo}>{term.nombre}</option>)}
              </select>
            </div>

            <div style={S.campo}>
              <label htmlFor="fecha" style={S.label}>{t.fecha}</label>
              {/* min = today: no searching for trips in the past */}
              <input id="fecha" type="date" value={fecha} min={hoy} onChange={e => setFecha(e.target.value)} style={S.input} />
            </div>

            <button className="sb-btn" onClick={buscar} style={S.buscar}>{t.buscar}</button>
          </div>
        </div>
      </div>

      <footer>
        <div className="sb-greca" />
        <p style={S.pie}>{t.footer} · <a href="/panel" style={{ textDecoration: 'underline' }}>{t.panelEmpresas}</a></p>
      </footer>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 },
  barra: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' },
  esquina: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  contenido: { flex: 1, width: '100%', maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' },
  tagline: { color: 'var(--tenue)', marginBottom: '.75rem' },
  titulo: { fontSize: 'clamp(2.4rem, 6vw, 4.25rem)', maxWidth: '13ch', marginBottom: '1rem' },
  sub: { fontSize: '1.15rem', color: 'var(--tenue)', maxWidth: '36ch' },
  caja: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 12px 32px -20px rgba(0, 0, 0, .8)' },
  campo: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '.9rem', fontWeight: 500, color: 'var(--tenue)' },
  input: { height: 44, padding: '0 12px', background: 'var(--superficie)', border: '1px solid var(--borde)' },
  intercambiar: { height: 44, border: '1px solid var(--borde)', background: 'var(--hundido)', color: 'var(--tinta)', cursor: 'pointer', fontSize: '1.1rem' },
  buscar: { height: 44, background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', padding: '0 22px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  pie: { padding: '1rem 1.5rem 1.5rem', textAlign: 'center', color: 'var(--tenue)', fontSize: '.95rem' },
}
