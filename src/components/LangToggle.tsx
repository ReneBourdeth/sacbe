'use client'

import { useLang, type Lang } from '@/lib/i18n'
import { conTransicion } from '@/lib/transicion'

/** ES | EN switch. The choice is remembered in the browser (see LangProvider). */
export default function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()

  const estiloBoton = (l: Lang): React.CSSProperties => ({
    background: lang === l ? 'var(--tinta)' : 'transparent',
    color: lang === l ? 'var(--fondo)' : 'var(--tenue)',
    border: 'none', borderRadius: 'var(--radio-btn)', padding: '2px 7px', fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', transition: 'background-color .25s, color .25s',
  })

  return (
    <div role="group" aria-label="Language" style={{ display: 'inline-flex', gap: 2, padding: 2, border: '1px solid var(--borde)', borderRadius: 'var(--radio-btn)', ...style }}>
      <button style={estiloBoton('es')} aria-pressed={lang === 'es'} onClick={() => lang !== 'es' && conTransicion(() => setLang('es'))}>ES</button>
      <button style={estiloBoton('en')} aria-pressed={lang === 'en'} onClick={() => lang !== 'en' && conTransicion(() => setLang('en'))}>EN</button>
    </div>
  )
}
