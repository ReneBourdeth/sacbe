import { flushSync } from 'react-dom'

type Doc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }

/**
 * Runs a page-wide change (theme, language) as a short view transition: a cross-fade, or with `desde`
 * a circle that opens from that point. Browsers without view transitions, and people who ask for
 * reduced motion, get the change at once.
 */
export function conTransicion(cambio: () => void, desde?: { x: number; y: number }) {
  const doc = document as Doc
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || quieto) { cambio(); return }
  if (desde) document.documentElement.dataset.vt = 'circulo'
  const t = doc.startViewTransition(() => flushSync(cambio))
  if (!desde) return
  const r = Math.hypot(Math.max(desde.x, innerWidth - desde.x), Math.max(desde.y, innerHeight - desde.y))
  t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${desde.x}px ${desde.y}px)`, `circle(${r}px at ${desde.x}px ${desde.y}px)`] },
      { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
    ).finished.finally(() => { delete document.documentElement.dataset.vt })
  }).catch(() => { delete document.documentElement.dataset.vt })
}
