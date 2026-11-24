'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'

/**
 * Light (white page) / night switch. The choice lives on <html data-tema="claro"> and in the browser;
 * the root layout's head line puts it back before the first paint, so the page never flashes dark.
 */
export default function TemaToggle() {
  const { lang } = useLang()
  const [claro, setClaro] = useState(false)
  useEffect(() => { setClaro(document.documentElement.dataset.tema === 'claro') }, [])

  function cambiar() {
    const nuevo = !claro
    setClaro(nuevo)
    if (nuevo) document.documentElement.dataset.tema = 'claro'
    else delete document.documentElement.dataset.tema
    try { localStorage.setItem('sacbe-tema', nuevo ? 'claro' : 'oscuro') } catch {}
  }

  const etiqueta = claro
    ? (lang === 'es' ? 'Cambiar a modo noche' : 'Switch to night mode')
    : (lang === 'es' ? 'Cambiar a modo claro' : 'Switch to light mode')
  return (
    <button type="button" onClick={cambiar} aria-label={etiqueta} title={etiqueta}
      style={{ width: 30, height: 30, display: 'inline-grid', placeItems: 'center', border: '1px solid var(--borde)', borderRadius: 'var(--radio)', background: 'transparent', color: 'var(--tinta)', cursor: 'pointer', fontSize: '1rem' }}>
      <span aria-hidden="true">{claro ? '☾' : '☀'}</span>
    </button>
  )
}
