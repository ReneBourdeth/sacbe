'use client'

import { useLang, type Lang } from '@/lib/i18n'

/** ES | EN switch. The choice is remembered in the browser (see LangProvider). */
export default function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()

  const estiloBoton = (l: Lang): React.CSSProperties => ({
    background: lang === l ? 'var(--dorado)' : 'transparent',
    color: lang === l ? 'var(--negro)' : 'var(--blanco3)',
    border: 'none', padding: '4px 9px', fontSize: '.62rem', letterSpacing: 1.5, cursor: 'pointer',
  })

  return (
    <div role="group" aria-label="Language" style={{ display: 'inline-flex', border: '1px solid var(--borde)', ...style }}>
      <button style={estiloBoton('es')} aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button>
      <button style={estiloBoton('en')} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
    </div>
  )
}
