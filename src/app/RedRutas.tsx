'use client'

import { nombreTerminal } from '@/lib/terminales'

// The six cities around the ring, roughly where they sit on the map (west left, coast on top)
const NODOS: { c: string; ang: number }[] = [
  { c: 'CPN', ang: 180 }, { c: 'SPS', ang: 240 }, { c: 'CEI', ang: 300 },
  { c: 'TGU', ang: 0 }, { c: 'CHO', ang: 60 }, { c: 'CMG', ang: 120 },
]
// The ring in the drawing's own units (the SVG scales to the panel)
const W = 1000, H = 560, CX = 500, CY = 280, RX = 380, RY = 205
const pos = (ang: number) => ({ x: CX + RX * Math.cos(ang * Math.PI / 180), y: CY + RY * Math.sin(ang * Math.PI / 180) })
const P = Object.fromEntries(NODOS.map(n => [n.c, pos(n.ang)]))

export type Par = { o: string; d: string | null }

type Props = {
  rutas: readonly (readonly [string, string, number])[]
  par: Par | null                    // the chosen origin (and destination)
  vista: [string, string] | null     // a route being looked at (a hovered row or city)
  onPar: (p: Par | null) => void
  onVista: (v: [string, string] | null) => void
  enlace: (o: string, d: string) => string
  T: { desde: string; elige: string; eligeDestino: (c: string) => string; ver: string; cambiar: string; quitar: string; alt: string }
}

/** The route network: pick an origin, then a destination; the red line draws that route and links to its buses. */
export default function RedRutas({ rutas, par, vista, onPar, onVista, enlace, T }: Props) {
  const precio = (a: string, b: string) => rutas.find(([x, y]) => (x === a && y === b) || (x === b && y === a))?.[2]
  const minimo = (c: string) => Math.min(...rutas.filter(([a, b]) => a === c || b === c).map(r => r[2]))
  // the line drawn: the chosen route, else the route being looked at
  const linea: [string, string] | null = par?.d ? [par.o, par.d] : vista
  const curva = (a: string, b: string) => {
    const p = P[a], q = P[b]
    // bend the chord a little toward the centre, so a route reads as a road, not a ruler line
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2
    return `M${p.x},${p.y} Q${mx + (CX - mx) * .35},${my + (CY - my) * .35} ${q.x},${q.y}`
  }

  function tocar(c: string) {
    if (!par || par.d) onPar({ o: c, d: null })           // first pick, or a new start after a full route
    else if (par.o === c) onPar(null)                      // same city again: clear
    else onPar({ o: par.o, d: c })
  }

  const elegido = par?.d ? par as { o: string; d: string } : null
  return (
    <div className="panel red-rutas" onMouseLeave={() => onVista(null)}>
      <svg className="rr-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="rr-aro" />
        <ellipse cx={CX} cy={CY} rx={110} ry={62} className="rr-aro rr-aro--in" />
        {NODOS.map(n => <line key={n.c} x1={CX} y1={CY} x2={P[n.c].x} y2={P[n.c].y} className="rr-radio" />)}
        {/* with an origin picked: faint roads to every other city */}
        {par && !par.d && NODOS.filter(n => n.c !== par.o).map(n => <path key={n.c} d={curva(par.o, n.c)} className="rr-posible" />)}
        {linea && <path key={linea.join()} d={curva(linea[0], linea[1])} className={`rr-ruta${par?.d ? ' is-fija' : ''}`} />}
      </svg>

      <div className="rr-centro">
        {elegido ? (
          <>
            <b>{nombreTerminal(elegido.o)} → {nombreTerminal(elegido.d)}</b>
            <span>{T.desde} L {precio(elegido.o, elegido.d)}</span>
            <a className="btn btn--primary rr-ver" href={enlace(elegido.o, elegido.d)}>{T.ver}</a>
            <span className="rr-acciones">
              <button type="button" onClick={() => onPar({ o: elegido.d, d: elegido.o })}>⇄ {T.cambiar}</button>
              <button type="button" onClick={() => onPar(null)}>{T.quitar}</button>
            </span>
          </>
        ) : par ? (
          <span className="rr-guia">{T.eligeDestino(nombreTerminal(par.o))}</span>
        ) : (
          <span className="rr-guia">{T.elige}</span>
        )}
      </div>

      <div className="rr-nodos" role="group" aria-label={T.alt}>
        {NODOS.map(n => {
          const p = P[n.c]
          const on = par?.o === n.c || par?.d === n.c || (!!linea && linea.includes(n.c))
          return (
            <button key={n.c} type="button" className={`rr-nodo${on ? ' is-on' : ''}`} aria-pressed={par?.o === n.c || par?.d === n.c}
              style={{ left: `${p.x / W * 100}%`, top: `${p.y / H * 100}%` }}
              onClick={() => tocar(n.c)}
              onMouseEnter={() => onVista(par && !par.d && par.o !== n.c ? [par.o, n.c] : null)}>
              <span className="rr-disco" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="10" r="2.3" fill="currentColor" /></svg>
              </span>
              <span className="rr-nombre">{nombreTerminal(n.c)}</span>
              <small>{par && !par.d && par.o !== n.c ? `L ${precio(par.o, n.c)}` : `${T.desde} L ${minimo(n.c)}`}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
