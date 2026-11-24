'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'
import { conTransicion } from '@/lib/transicion'

/**
 * Light (white page) / night switch. The choice lives on <html data-tema="claro"> and in the browser;
 * the root layout's head line puts it back before the first paint, so the page never flashes dark.
 * The new theme opens as a circle from the button (a view transition; browsers without one just switch).
 */
export default function TemaToggle() {
  const { lang } = useLang()
  const [claro, setClaro] = useState(false)
  useEffect(() => { setClaro(document.documentElement.dataset.tema === 'claro') }, [])

  function cambiar(e: React.MouseEvent<HTMLButtonElement>) {
    const nuevo = !claro
    const r = e.currentTarget.getBoundingClientRect()
    conTransicion(() => {
      setClaro(nuevo)
      if (nuevo) document.documentElement.dataset.tema = 'claro'
      else delete document.documentElement.dataset.tema
    }, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
    try { localStorage.setItem('sacbe-tema', nuevo ? 'claro' : 'oscuro') } catch {}
  }

  const etiqueta = claro
    ? (lang === 'es' ? 'Cambiar a modo noche' : 'Switch to night mode')
    : (lang === 'es' ? 'Cambiar a modo claro' : 'Switch to light mode')
  return (
    <button type="button" className="tema-toggle" onClick={cambiar} aria-label={etiqueta} title={etiqueta}
      style={{ width: 32, height: 32, padding: 0, display: 'inline-grid', placeItems: 'center', border: '1px solid var(--borde)', borderRadius: 'var(--radio-btn)', background: 'transparent', color: 'var(--tinta)', cursor: 'pointer' }}>
      {/* drawn icons, centred on a 24px grid (a text ☀ sat off-centre) */}
      <svg key={claro ? 'luna' : 'sol'} className="tema-icono" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {claro
          ? <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" stroke="none" />
          : <><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>}
      </svg>
    </button>
  )
}
