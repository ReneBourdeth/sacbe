'use client'

import { useLang, type Lang } from '@/lib/i18n'

/** ES | EN switch. The choice is remembered in the browser (see LangProvider). */
export default function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()

  const estiloBoton = (l: Lang): React.CSSProperties => ({
    background: lang === l ? 'var(--tinta)' : 'transparent',
    color: lang === l ? 'var(--fondo)' : 'var(--tenue)',
    border: 'none', borderRadius: 4, padding: '3px 9px', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer',
  })

  return (
    <div role="group" aria-label="Language" style={{ display: 'inline-flex', gap: 2, padding: 2, border: '1px solid var(--borde)', borderRadius: 6, ...style }}>
      <button style={estiloBoton('es')} aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button>
      <button style={estiloBoton('en')} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
    </div>
  )
}
