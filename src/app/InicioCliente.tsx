'use client'

/* type: software (a booking app for intercity buses)
   deal: hero collage, nav nav-centre, close close-word, footer footer-dark, rhythm space,
         buttons tonal, mark: the client's own macaw logo, ground sky, type red-hat, radius round;
         colours: the client's own (start.mjs brand: black, white, macaw red), not the dealt palette;
         photographs from the earlier design under glass panels, as the client asked
   moments: giant-type-pass (#ciudades; counter-rolls was dealt first, dealt again: its 1em digit window clips Red Hat's figures)
   Built with the taste skill's kit (public/assets), loaded after React has hydrated. */

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'
import { getRutasActivas } from '@/lib/api'
import { hoyHonduras } from '@/lib/fecha'
import { TERMINALES, nombreTerminal } from '@/lib/terminales'
import AuthLink from '@/components/AuthLink'
import LangToggle from '@/components/LangToggle'
import TemaToggle from '@/components/TemaToggle'
import { MarcaGuacamaya } from '@/components/Simbolos'
import { TEXTOS, SALIDAS, RUTAS } from './inicio-textos'
import { FOTOS, foto } from '@/lib/fotos'

const CSS = [
  'system.css', 'ui/cards.css', 'motion/motion.css', 'backgrounds/backgrounds.css', 'layout/layout.css',
  'icons/icon.css', 'ui/base.css', 'ui/window/fragment.css', 'diagrams/diagram.css', 'layout/demo.css', 'inicio.css',
]
const SCRIPTS = ['system.js', 'motion/motion.js', 'layout/layout.js', 'diagrams/mount.js']
// Copán's ball court, public domain (Talk2winik, Wikimedia Commons), credited in the footer
const FOTO_COPAN = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/CPN_BallCourt_01.jpg/1920px-CPN_BallCourt_01.jpg'
const PASOS_FOTOS = [FOTOS.carretera, FOTOS.roatan, FOTOS.bus]

// The kit's scripts change the DOM (entrances, nav sheet, moments). Loading them after hydration
// keeps React's markup and the kit's changes from clashing.
function useKit() {
  useEffect(() => {
    for (const src of SCRIPTS) {
      if (document.querySelector(`script[data-kit="${src}"]`)) continue
      const s = document.createElement('script')
      s.type = 'module'; s.src = `/assets/${src}`; s.dataset.kit = src
      document.body.appendChild(s)
    }
    // the kit's html classes stay: they only act on the home page's hero and moments
  }, [])
}

// The seat map in the app window: 10 rows of 4 seats, taken ones from a fixed pattern.
const OCUPADOS = new Set(['1A', '1B', '2C', '3A', '3D', '5B', '5C', '6A', '7D', '8B', '8C', '9A', '10C', '10D'])
const ELEGIDOS = new Set(['4C', '4D'])
// Each city's lowest fare to anywhere, from RUTAS (the database's prices)
const CIUDADES_DESDE = ['SPS', 'TGU', 'CEI', 'CMG', 'CHO', 'CPN'].map(c =>
  [c, Math.min(...RUTAS.filter(([a, b]) => a === c || b === c).map(r => r[2]))] as const)

export default function InicioCliente() {
  const { lang } = useLang()
  const T = TEXTOS[lang]
  useKit()

  const [origen, setOrigen] = useState('SPS')
  const [destino, setDestino] = useState('TGU')
  const [fecha, setFecha] = useState('')
  const [hoy, setHoy] = useState('') // read in the browser: the page is built once per release
  useEffect(() => { const d = hoyHonduras(); setHoy(d); setFecha(f => f || d) }, [])

  // Only cities with buses; every city until the routes load or if loading fails
  const [rutas, setRutas] = useState<Set<string> | null>(null)
  useEffect(() => { getRutasActivas().then(setRutas).catch(() => {}) }, [])
  const hayBus = (o: string, d: string) => !rutas || rutas.has(`${o}-${d}`)
  const origenes = TERMINALES.filter(o => TERMINALES.some(d => hayBus(o.codigo, d.codigo)))
  const destinos = TERMINALES.filter(d => d.codigo !== origen && hayBus(origen, d.codigo))

  function cambiarOrigen(o: string) {
    setOrigen(o)
    if (!hayBus(o, destino)) setDestino(TERMINALES.find(d => d.codigo !== o && hayBus(o, d.codigo))?.codigo ?? destino)
  }

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (origen === destino) return
    // a full page load: the results page must not keep the home page's kit flags on <html>
    location.assign(`/resultados?${new URLSearchParams({ origen, destino, fecha })}`)
  }

  const clase = (c: string) => ({ economica: lang === 'es' ? 'Económica' : 'Economy', ejecutivo: lang === 'es' ? 'Ejecutivo' : 'Executive', primera: lang === 'es' ? 'Primera' : 'First' }[c] ?? c)
  const flecha = <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path className="m-arrow__stem" d="M1 6h8" /><path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" /></svg>

  return (
    <>
      {/* the kit's stylesheets, after globals.css, then the dealt palette exactly as start.mjs printed it */}
      {CSS.map(href => <link key={href} rel="stylesheet" href={`/assets/${href}`} />)}
      <style dangerouslySetInnerHTML={{ __html: `:root {
  --p-bg: #000000; --p-surface: #141414; --p-ink: #ffffff; --p-muted: #c9cfc2;
  --p-accent: #d7263d; --p-accent-ink: #ffffff; --p-action: #d7263d; --p-action-ink: #ffffff;
  --p-inv-bg: #ffffff; --p-inv-surface: #e8e8e8; --p-inv-ink: #000000; --p-inv-muted: #424242;
  --p-inv-accent: #d7263d; --p-inv-accent-ink: #ffffff; --p-inv-action: #d7263d; --p-inv-action-ink: #ffffff;
  --font-display: "Red Hat Display", system-ui, sans-serif;
  --font-text: "Red Hat Text", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 700;
  --display-tracking: -0.04em;
  --display-tracking-xl: -0.05em;
}
/* light mode (the client's colours on a white page): the inverse of the brand palette above */
html[data-tema="claro"] {
  color-scheme: light;
  --p-bg: #ffffff; --p-surface: #f2f2f2; --p-ink: #000000; --p-muted: #424242;
  --p-inv-bg: #000000; --p-inv-surface: #141414; --p-inv-ink: #ffffff; --p-inv-muted: #c9cfc2;
}` }} />

      <header className="nav nav--centre">
        <div className="wrap nav__bar">
          <a className="skip-link" href="#top">{T.saltar}</a>
          <a className="nav__logo" href="#top"><MarcaGuacamaya size={26} />Sacbé</a>
          <nav className="nav__links" aria-label={lang === 'es' ? 'Principal' : 'Main'}>
            <div className="nav__item"><a className="nav__link" href="#asientos">{T.nav.asientos}</a></div>
            <div className="nav__item"><a className="nav__link" href="#prices">{T.nav.rutas}</a></div>
            <div className="nav__item"><a className="nav__link" href="#empresas">{T.nav.empresas}</a></div>
            <div className="nav__item"><a className="nav__link" href="#faq">{T.nav.preguntas}</a></div>
          </nav>
          <div className="nav__actions">
            <span className="idioma"><LangToggle /></span>
            <span className="idioma"><TemaToggle /></span>
            <AuthLink className="nav__link" />
            <a className="btn btn--primary" href="#buscar">{T.accion}</a>
          </div>
          <button className="nav__toggle" type="button" aria-expanded="false" aria-label={T.nav.menu}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      <main id="top">
        {/* HERO: collage. The search form is the main action, in place of the hero's buttons. */}
        <section className="hero hero--collage" data-enter aria-labelledby="hero-h">
          <div className="wrap"><div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <h1 id="hero-h">{T.hero.h1}</h1>
              <p className="hero__lead">{T.hero.lead}</p>
              <form id="buscar" className="buscador" onSubmit={buscar}>
                <div className="field"><label htmlFor="origen">{T.hero.origen}</label>
                  <select id="origen" value={origen} onChange={e => cambiarOrigen(e.target.value)}>
                    {origenes.map(c => <option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}
                  </select></div>
                <div className="field"><label htmlFor="destino">{T.hero.destino}</label>
                  <select id="destino" value={destino} onChange={e => setDestino(e.target.value)}>
                    {destinos.map(c => <option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}
                  </select></div>
                <div className="field"><label htmlFor="fecha">{T.hero.fecha}</label>
                  <input id="fecha" type="date" value={fecha} min={hoy} required onChange={e => setFecha(e.target.value)} /></div>
                <div className="btn-row"><button className="btn btn--primary" type="submit">{T.accion}{flecha}</button></div>
              </form>
              <p className="hero__proof">{T.hero.prueba}</p>
            </div>
            <div className="hero__art span-6 start-7" role="img" aria-label={T.hero.arte}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Wikimedia photos, served already sized */}
              <img className="foto-panel" src={foto(FOTOS.piramide.f)} alt="" fetchPriority="high" />
              <div className="ly-piece ly-piece--main d-win d-win--dark" aria-hidden="true">
                <div className="d-win__bar"><span className="d-win__dots"><i /><i /><i /></span><span>Sacbé · San Pedro Sula → Tegucigalpa</span></div>
                <div className="d-win__body">
                  <div className="d-side">
                    <span className="is-on"><i />{T.app.side[0]}</span><span><i />{T.app.side[1]}</span><span><i />{T.app.side[2]}</span>
                  </div>
                  <div className="d-main">
                    <div className="d-main__head"><h4>{T.hero.ventana}</h4></div>
                    <div className="d-rows">
                      {SALIDAS.slice(0, 7).map((s, i) => (
                        <div className="d-row" key={i}>
                          <span className="d-thumb d-hora">{s.hora}</span>
                          <div><b>{s.empresa}</b><small>{clase(s.clase)}</small></div>
                          <span className="num">L {s.precio}</span>
                          <span className={`d-chip${i === 4 ? ' d-chip--low' : ''}`}>{i === 4 ? `6 ${T.app.libres}` : `40 ${T.app.libres}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="ly-piece ly-piece--note d-card" aria-hidden="true" data-ly-steps="700">
                <div className="d-card__row"><h5>{T.hero.tarjeta}</h5><span className="d-chip" data-step data-step-at="4">{T.hero.listo}</span></div>
                <div className="d-note__line" data-step><i>✓</i><span><b>{T.hero.apartado}</b></span></div>
                <div className="d-note__line" data-step><i>✓</i><span>{T.hero.pagar}</span></div>
                <div className="d-note__line" data-step><i>✓</i><span><b>{T.hero.qr}</b></span></div>
              </div>
            </div>
          </div></div>
        </section>

        {/* APP-FRAME: the departures list beside the open bus's seat map */}
        <section className="section" id="asientos" aria-labelledby="asientos-h">
          <div className="wrap">
            <div className="grid">
              <h2 id="asientos-h" className="span-5">{T.app.h2}</h2>
              <p className="span-6 start-7">{T.app.p} <a className="link" href="/resultados?origen=SPS&destino=TGU">{T.app.link}</a></p>
            </div>
            <div className="ui app fill" role="img" aria-label={T.app.arte}>
              <div className="app__pane app__pane--list">
                <div className="ui ui-panel ui-win" data-ui="window" data-open="—" data-work="—" data-done="—">
                  <div className="ui-win__bar">
                    <span className="ui-dots" aria-hidden="true"><i /><i /><i /></span>
                    <span className="ui-win__crumb">Sacbé <i>/</i> <b>{T.app.side[0]}</b></span>
                    <span className="ui-spacer" />
                  </div>
                  <div className="ui-win__body">
                    <nav className="ui-win__side" aria-hidden="true">
                      <span className="ui-win__nav is-on">{T.app.side[0]}<em>12</em></span>
                      <span className="ui-win__nav">{T.app.side[1]}</span>
                      <span className="ui-win__nav">{T.app.side[2]}<em>30</em></span>
                    </nav>
                    <div className="ui-win__main">
                      <div className="ui-win__cols" aria-hidden="true">{T.app.cols.map(c => <span key={c}>{c}</span>)}</div>
                      <ul className="ui-win__rows">
                        {SALIDAS.map((s, i) => (
                          <li className={`ui-win__row${i === 4 ? ' is-open' : ''}`} key={i}>
                            <span className="ui-avatar" data-tone={(i % 5) + 1}>{s.empresa.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                            <span className="ui-win__who">{s.empresa}</span>
                            <span className="ui-win__sub">{s.hora} · {clase(s.clase)} · L {s.precio}</span>
                            <span className={`ui-win__st${i === 4 ? ' is-you' : ''}`}>{i === 4 ? `6 ${T.app.libres}` : `40 ${T.app.libres}`}</span>
                            <span className="ui-win__age">{s.hora}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="app__pane app__pane--open">
                <div className="ui ui-panel mapa">
                  <div className="mapa__head">
                    <div><b>Viana · 10:00</b><small>{clase('ejecutivo')} · L 442</small></div>
                    <div className="mapa__leyenda"><span><i className="m-libre" />{T.app.libre}</span><span><i className="m-ocupado" />{T.app.ocupado}</span><span><i className="m-tuyo" />{T.app.tuyo}</span></div>
                  </div>
                  <div className="mapa__bus">
                    <span className="mapa__frente">{T.app.frente}</span>
                    {Array.from({ length: 10 }, (_, f) => (
                      <div className="mapa__fila" key={f}>
                        {['A', 'B', '', 'C', 'D'].map(col => {
                          if (!col) return <span key="pasillo" className="mapa__pasillo" />
                          const n = `${f + 1}${col}`
                          return <span key={n} className={`mapa__asiento${OCUPADOS.has(n) ? ' is-ocupado' : ''}${ELEGIDOS.has(n) ? ' is-tuyo' : ''}`}>{n}</span>
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="mapa__pie"><span>{T.app.resumen}</span><span className="d-btn mapa__btn">{T.app.continuar}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SPLIT-TEXT-LEFT: cash payment */}
        <section className="section" id="pago" aria-labelledby="pago-h">
          <div className="wrap">
            <div className="grid">
              <div className="span-5 stack-6">
                <h2 id="pago-h">{T.pago.h2}</h2>
                <p className="t-lead">{T.pago.p}</p>
                <ul className="datos">{T.pago.datos.map(d => <li key={d}>{d}</li>)}</ul>
                <a className="link" href="#faq">{T.pago.link}</a>
              </div>
              <div className="frame frame--split span-6 start-7" role="img" aria-label={T.pago.arte}>
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Wikimedia photos, served already sized */}
                <img className="foto-panel" src={foto(FOTOS.tegucigalpa.f)} alt="" loading="lazy" />
                <div className="stage stage--fade-br">
                  <div className="at-rise to-edge recibo-pos">
                    <div className="ui ui-panel recibo">
                      <div className="recibo__head"><b>{T.pago.reserva} SCB-7Q2K-M9XD-4TFA</b><span className="d-chip recibo__chip">{T.pago.pagado}</span></div>
                      <p className="recibo__viaje">{T.pago.viaje}</p>
                      <dl className="recibo__filas">
                        <div><dt>{T.pago.asientos}</dt><dd>4C, 4D</dd></div>
                        <div><dt>{lang === 'es' ? 'Boletos' : 'Tickets'}</dt><dd>2 × L 442</dd></div>
                        <div><dt>{lang === 'es' ? 'Servicio' : 'Service'}</dt><dd>2 × L 15</dd></div>
                        <div className="recibo__total"><dt>{T.pago.total}</dt><dd>L 914</dd></div>
                      </dl>
                      <div className="recibo__agencia">PagoExpress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICE LIST: routes and lowest fares (the page's calm section) */}
        <section className="section g2" id="prices" aria-labelledby="rutas-h">
          <div className="wrap">
            <div className="group">
              <div className="section-head">
                <h2 id="rutas-h">{T.rutas.h2}</h2>
                <p>{T.rutas.p}</p>
              </div>
              <div className="grid rutas-lista">
                {[RUTAS.slice(0, 8), RUTAS.slice(8)].map((col, c) => (
                  <ul className="rows span-6" key={c}>
                    {col.map(([a, b, p]) => (
                      <li key={a + b}><span className="rows__name">{nombreTerminal(a)} ↔ {nombreTerminal(b)}</span><span className="rows__value">{T.rutas.desde} L {p}</span></li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
            {/* the route network as the kit's ring diagram, each city with its lowest real fare */}
              <div className="panel red-rutas"><div className="dg" data-dg-still data-diagram={JSON.stringify({
                layout: 'ring', size: 'band', ground: 'none', motion: { pulse: 'none' }, alt: T.rutas.alt, center: { label: 'Sacbé', icon: 'ui:globe' },
                ring: CIUDADES_DESDE.map(([c, l]) => ({ label: nombreTerminal(c), icon: 'ui:map-pin', meta: `${T.rutas.desde} L ${l}` })),
              })} /></div>
          </div>
        </section>

        {/* STEPS: the booking order is the content */}
        <section className="section" id="pasos" aria-labelledby="pasos-h">
          <div className="wrap">
            <div className="section-head"><h2 id="pasos-h">{T.pasos.h2}</h2></div>
            <div className="grid">
              {T.pasos.tarjetas.map((c, i) => (
                <article className="card card--row card--open span-4" key={i}>
                  <span className="step-num">{i + 1}</span>
                  <h3>{c.h3}</h3>
                  <p>{c.p}</p>
                  <div className="panel">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Wikimedia photos, served already sized */}
                    <img className="foto-panel" src={foto(PASOS_FOTOS[i].f, 960)} alt="" loading="lazy" />
                    <div className="stage stage--fade-b"><div className="at-rise fit paso-pos">
                      {i === 0 && (
                        <div className="ui ui-panel mini">
                          <div className="mini__fila"><span>{T.pasos.pasajero}</span><b>4C</b></div>
                          <div className="mini__campo">{T.pasos.identidad}<span>0801-1990-•••••</span></div>
                          <div className="mini__fila"><span>{T.pasos.pasajero}</span><b>4D</b></div>
                          <div className="mini__campo">{T.pasos.identidad}<span>0801-1994-•••••</span></div>
                        </div>
                      )}
                      {i === 1 && (
                        <div className="ui ui-panel mini">
                          <div className="mini__fila"><span>SCB-7Q2K</span><span className="d-chip d-chip--low">{T.pago.pendiente}</span></div>
                          <div className="mini__fila"><span>SCB-7Q2K</span><span className="d-chip">{T.pago.pagado}</span></div>
                          <div className="mini__campo">PagoExpress<span>L 914</span></div>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="ui ui-panel mini mini--qr">
                          <span className="mini__qr" aria-hidden="true" />
                          <div className="mini__fila"><b>{T.pasos.escaneado}</b><span className="d-chip">{T.pasos.abordo}</span></div>
                        </div>
                      )}
                    </div></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES-2X2: the company panel, two screens */}
        <section className="section g2" id="empresas" aria-labelledby="empresas-h">
          <div className="wrap">
            <div className="group">
              <div className="section-head">
                <h2 id="empresas-h">{T.empresas.h2} <span className="muted">{T.empresas.gris}</span></h2>
                <p><a className="link" href="/panel">{T.empresas.link}</a></p>
              </div>
              <div className="grid">
                {T.empresas.tarjetas.slice(0, 2).map((c, i) => <TarjetaEmpresa key={i} i={i} c={c} T={T} />)}
              </div>
            </div>
            <div className="grid">
              {T.empresas.tarjetas.slice(2).map((c, i) => <TarjetaEmpresa key={i + 2} i={i + 2} c={c} T={T} />)}
            </div>
          </div>
        </section>

        {/* FAQ: every answer open */}
        <section className="section" id="faq" aria-labelledby="preguntas-h">
          <div className="wrap">
            <div className="grid">
              <div className="span-5 stack-4">
                <h2 id="preguntas-h">{T.faq.h2}</h2>
                <p className="muted">{T.faq.p}</p>
                <a className="link" href="mailto:soporte@sacbe.example">{T.faq.link}</a>
              </div>
              <div className="faq span-6 start-7">
                {T.faq.items.map(f => <div className="faq__item" key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
              </div>
            </div>
          </div>
        </section>
        {/* STATEMENT: the dealt moment giant-type-pass, Copán's ball court passing through the words */}
        <section className="section statement" id="ciudades" data-moment="giant-type-pass" data-moment-opts={JSON.stringify({ image: FOTO_COPAN, travel: 60, focusY: 62 })} aria-labelledby="ciudades-h">
          <div className="wrap">
            <h2 className="mo-gt__type" id="ciudades-h">{T.ciudades.h2a}<br />{T.ciudades.h2b}</h2>
            <div className="mo-gt__row"><p>{T.ciudades.p}</p><a className="link" href="#prices">{T.ciudades.link}</a></div>
          </div>
        </section>
      </main>

      <footer className="footer closing footer--dark ground-inverse" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--word">
            <div className="section-head--split">
              <div><h2 id="close-h">{T.cierre.h2}</h2><p className="t-lead">{T.cierre.p}</p></div>
              <a className="btn btn--primary" href="#buscar">{T.accion}{flecha}</a>
            </div>
            <p className="close__word" aria-hidden="true">Sacbé</p>
          </div>
          <div className="closing__links">
            <div className="grid">
              <div className="span-4 stack-4">
                <a className="nav__logo" href="#top"><MarcaGuacamaya size={26} />Sacbé</a>
                <p className="footer__lede">{T.pie.lede}</p>
              </div>
              {T.pie.cols.map(col => (
                <div className="span-2 footer__col" key={col.h}><h3>{col.h}</h3>
                  <ul>{col.links.map(([txt, href]) => <li key={href}><a href={href}>{txt}</a></li>)}</ul>
                </div>
              ))}
            </div>
            <div className="footer__legal"><span>© 2026 Sacbé</span><div className="socials" /><a className="credits" href="/creditos">{T.creditos}</a></div>
          </div>
        </div>
      </footer>
    </>
  )
}

type Tx = (typeof TEXTOS)['es']

/** One card of the company panel section, with a small drawn piece of the real panel. */
function TarjetaEmpresa({ i, c, T }: { i: number; c: { h3: string; p: string }; T: Tx }) {
  return (
    <article className="card card--row card--open span-6">
      <h3>{c.h3}</h3>
      <p>{c.p}</p>
      <div className="panel">
        <div className="stage stage--fade-b"><div className="at-rise fit panel-pos">
          <div className="ui ui-panel mini mini--ancho">
            {i === 0 && <>
              <div className="mini__fila"><b>Hedman Alas · 06:00</b><span>SPS → TGU</span></div>
              {[['1A', 'SCB-PAGA-EFEC', 1], ['3B', 'SCB-ABOR-DAR1', 0], ['3C', 'SCB-ABOR-DAR2', 0], ['5A', 'SCB-REEM-BOLS', 1]].map(([a, code, p]) => (
                <div className="mini__fila" key={a as string}><span>{a} · {code}</span><span className={`d-chip${p ? ' d-chip--low' : ''}`}>{p ? T.empresas.pendiente : T.empresas.pagado}</span></div>
              ))}
            </>}
            {i === 1 && <>
              <span className="mini__qr" aria-hidden="true" />
              <div className="mini__fila"><span>SCB-ABOR-DAR1-TEST</span><span className="d-chip">{T.empresas.valido}</span></div>
              <div className="mini__fila"><span>SCB-YAAB-ORDO-TEST</span><span className="d-chip d-chip--out">{T.empresas.usado}</span></div>
            </>}
            {i === 2 && <>
              <div className="mini__fila"><b>{T.empresas.nueva}</b><span>SPS → CEI</span></div>
              <div className="mini__campo">{T.hero.fecha}<span>12/11/2026</span></div>
              <div className="mini__campo">{T.empresas.hora}<span>14:00</span></div>
              <div className="mini__campo">{T.empresas.precio}<span>L 330</span></div>
            </>}
            {i === 3 && <>
              <div className="mini__fila"><b>{T.empresas.ingresos}</b><span>Hedman Alas</span></div>
              {/* Hedman Alas's real November report in the database */}
              {([['SPS → TGU', 3, 1368, 4], ['TGU → SPS', 1, 380, 0]] as const).map(([r, n, l, p]) => (
                <div className="mini__campo" key={r}>{r} · {n} {T.empresas.pagado.toLowerCase()} · {p} {T.empresas.pendiente.toLowerCase()}<span>L {l.toLocaleString('en-US')}</span></div>
              ))}
            </>}
          </div>
        </div></div>
      </div>
    </article>
  )
}
