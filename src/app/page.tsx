'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { hoyHonduras } from '@/lib/fecha'
import { TERMINALES } from '@/lib/terminales'
import AuthLink from '@/components/AuthLink'
import LangToggle from '@/components/LangToggle'

/** Home: hero text and the trip search (from, to, date). */
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
    <main className="sb-home" style={S.main}>
      <div style={S.esquina}>
        <AuthLink />
        <LangToggle />
      </div>

      <div style={S.tagline}>{t.tagline}</div>
      <h1 style={S.titulo}>
        {t.heroA}<br />
        <em style={{ color: 'var(--dorado)' }}>{t.heroB}</em>
      </h1>

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

          <button onClick={buscar} style={S.buscar}>{t.buscar}</button>
        </div>
      </div>

      <p style={S.pie}>{t.footer}</p>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 },
  esquina: { position: 'absolute', top: '1.25rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  tagline: { fontFamily: 'serif', fontSize: '.7rem', letterSpacing: 4, textTransform: 'uppercase', color: 'var(--dorado)', marginBottom: '1rem' },
  titulo: { fontFamily: 'serif', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 600, lineHeight: 1, textAlign: 'center', marginBottom: '2rem', color: 'var(--blanco)' },
  caja: { background: 'var(--negro3)', border: '1px solid var(--borde)', padding: '1.75rem', width: '100%', maxWidth: 700 },
  campo: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dorado)' },
  input: { padding: '10px 13px', background: 'var(--negro4)', border: '1px solid var(--borde2)', color: 'var(--blanco)', fontSize: '.875rem', outline: 'none' },
  intercambiar: { height: 32, border: '1px solid var(--borde)', background: 'transparent', color: 'var(--dorado)', cursor: 'pointer', fontSize: '1rem', alignSelf: 'end' },
  buscar: { background: 'var(--dorado)', color: 'var(--negro)', border: 'none', padding: '11px 20px', fontSize: '.7rem', letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'end' },
  pie: { marginTop: '2rem', fontFamily: 'serif', fontStyle: 'italic', color: 'var(--blanco3)', fontSize: '.9rem' },
}
