'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { hoyHonduras } from '@/lib/fecha'
import { TERMINALES, nombreTerminal } from '@/lib/terminales'
import AuthLink from '@/components/AuthLink'
import LangToggle from '@/components/LangToggle'
import { Logo } from '@/components/SiteHeader'

// Free-licence photos from Wikimedia Commons, loaded from their servers.
// CC BY licences require the credit shown in the footer.
const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/thumb/'
const FOTOS = [
  // Same photo as every page's background (globals.css), so the site opens on it
  { archivo: '0/04/CPN_BallCourt_01.jpg', lugar: 'Copán Ruinas', origen: 'SPS', destino: 'CPN',
    autor: 'Talk2winik', licencia: 'Public domain', pagina: 'File:CPN_BallCourt_01.jpg' },
  { archivo: 'a/ab/West_Bay_Beach_-Roatan_-Honduras-23May2009.jpg', lugar: 'Roatán', origen: 'SPS', destino: 'CEI', // ferry leaves from La Ceiba
    autor: 'Adalberto Hernandez Vega', licencia: 'CC BY 2.0', pagina: 'File:West_Bay_Beach_-Roatan_-Honduras-23May2009.jpg' },
  { archivo: '4/4a/Cumulus_clouds_over_Tegucigalpa%2C_Honduras.jpg', lugar: 'Tegucigalpa', origen: 'SPS', destino: 'TGU',
    autor: 'Straggles', licencia: 'CC0', pagina: 'File:Cumulus_clouds_over_Tegucigalpa,_Honduras.jpg' },
]
const foto = (archivo: string, ancho: number) => `${COMMONS}${archivo}/${ancho}px-${archivo.split('/').pop()}`

/** Home: side menu, full-screen photo with the headline and trip search, then a statement line. */
export default function HomePage() {
  const router = useRouter()
  const { t } = useLang()
  const [origen, setOrigen] = useState('SPS')
  const [destino, setDestino] = useState('TGU')
  const [fecha, setFecha] = useState('')
  const [actual, setActual] = useState(0)

  // This page is built once per release, so "today" must be read in the
  // visitor's browser, not at build time (it would stay on the release day).
  const [hoy, setHoy] = useState('')
  useEffect(() => {
    const dia = hoyHonduras()
    setHoy(dia)
    setFecha(f => f || dia)
  }, [])

  // Next photo 7 s after the last change (also after a manual pick), unless the
  // visitor asked their device for less motion
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => setActual(i => (i + 1) % FOTOS.length), 7000)
    return () => clearTimeout(id)
  }, [actual])

  function intercambiar() {
    setOrigen(destino)
    setDestino(origen)
  }

  function buscar() {
    if (origen === destino) return alert(t.origenDestinoIguales)
    const params = new URLSearchParams({ origen, destino, fecha })
    router.push(`/resultados?${params}`)
  }

  const f = FOTOS[actual]

  return (
    <>
      <div className="sb-plumas" />
      <main className="sb-inicio">
        <aside className="sb-lateral">
          <Logo />
          <nav className="sb-lateral-nav">
            <a href="#buscar" className="sb-solo-ancho">{t.navBuscar}</a>
            <AuthLink style={{ fontSize: 'inherit', fontWeight: 'inherit' }} />
            <Link href="/panel" className="sb-solo-ancho">{t.panelEmpresas}</Link>
          </nav>
          <LangToggle style={{ alignSelf: 'flex-start' }} />
        </aside>

        <section className="sb-portada">
          {FOTOS.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- remote photos, served already sized by Wikimedia
            <img key={p.archivo} className="sb-foto" data-activa={i === actual} alt=""
              src={foto(p.archivo, 1280)} srcSet={`${foto(p.archivo, 960)} 960w, ${foto(p.archivo, 1920)} 1920w`} sizes="100vw" />
          ))}
          <div className="sb-velo" />

          {/* Top-right corner, kept in the normal layout so it can never cover the headline */}
          <div className="sb-portada-arriba">
          <div className="sb-indicadores">
            {FOTOS.map((p, i) => (
              <button key={p.lugar} onClick={() => setActual(i)} aria-label={t.verFoto(p.lugar)} aria-current={i === actual}><span /></button>
            ))}
          </div>

          {/* No date: the results page uses today, read in the visitor's browser */}
          <Link className="sb-destacada" href={`/resultados?${new URLSearchParams({ origen: f.origen, destino: f.destino })}`}>
            <span style={S.cardFila}><span>{t.rutaDestacada}</span><span>{f.lugar}</span></span>
            <strong style={S.cardRuta}>{nombreTerminal(f.origen)} → {nombreTerminal(f.destino)}</strong>
            <span style={S.cardLink}>{t.verHorarios}</span>
          </Link>
          </div>

          <div>
            <p style={S.tagline}>{t.tagline}</p>
            <h1 className="sb-titulo">{t.heroA}</h1>
            <p style={S.sub}>{t.heroB}</p>
          </div>

          <div id="buscar" className="sb-search-box" style={S.caja}>
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
        </section>

        <section className="sb-declaracion">
          <p>{t.declaracion}</p>
        </section>

        <footer style={S.pie}>
          <p>{t.footer} · <Link href="/panel" style={{ textDecoration: 'underline' }}>{t.panelEmpresas}</Link></p>
          <p style={S.creditos}>
            {t.fotos}:{' '}
            {FOTOS.map((p, i) => (
              <span key={p.pagina}>
                {i > 0 && ' · '}
                <a href={`https://commons.wikimedia.org/wiki/${p.pagina}`} style={{ textDecoration: 'underline' }}>{p.lugar}</a> — {p.autor} ({p.licencia})
              </span>
            ))}
            , Wikimedia Commons
          </p>
        </footer>
      </main>
    </>
  )
}

const S: Record<string, React.CSSProperties> = {
  tagline: { marginBottom: '.75rem', fontWeight: 600 },
  sub: { fontSize: '1.15rem', color: 'var(--tenue)', maxWidth: '36ch', marginTop: '1rem' },
  cardFila: { display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--tenue)' },
  cardRuta: { fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em' },
  cardLink: { fontWeight: 600, color: 'var(--tinta)' },
  caja: { background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 'var(--radio)', padding: '1.25rem', maxWidth: 1000 },
  campo: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '.9rem', fontWeight: 500, color: 'var(--tenue)' },
  input: { height: 44, padding: '0 12px', background: 'var(--superficie)', border: '1px solid var(--borde)' },
  intercambiar: { height: 44, border: '1px solid var(--borde)', background: 'var(--hundido)', color: 'var(--tinta)', cursor: 'pointer', fontSize: '1.1rem' },
  buscar: { height: 44, background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', padding: '0 22px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  pie: { padding: '1.5rem clamp(1rem, 4vw, 2.5rem) 2rem', color: 'var(--tenue)', fontSize: '.95rem', display: 'flex', flexDirection: 'column', gap: '.5rem' },
  creditos: { fontSize: '.8rem' },
}
