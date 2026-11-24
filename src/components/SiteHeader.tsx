'use client'

import AuthLink from './AuthLink'
import LangToggle from './LangToggle'
import TemaToggle from './TemaToggle'
import { MarcaGuacamaya } from './Simbolos'
import { useLang } from '@/lib/i18n'
import { TEXTOS } from '@/app/inicio-textos'

/**
 * Top bar of every inner page, laid out like the home page's bar: logo left, the home sections in the
 * middle, language, theme, sign-in and "Buscar buses" right. Pages put extra links before sign-in
 * via `children` (e.g. "Change search" on the results page).
 */
export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  const { lang } = useLang()
  const T = TEXTOS[lang]
  return (
    <div style={S.pegado}>
      <header className="sb-header" style={S.header}>
        <Logo />
        <nav className="sb-header-centro" aria-label={lang === 'es' ? 'Principal' : 'Main'}>
          <a href="/#asientos">{T.nav.asientos}</a>
          <a href="/#prices">{T.nav.rutas}</a>
          <a href="/#empresas">{T.nav.empresas}</a>
          <a href="/#faq">{T.nav.preguntas}</a>
        </nav>
        <div className="sb-header-links" style={S.links}>
          <LangToggle />
          <TemaToggle />
          {children}
          <AuthLink />
          <a className="sb-btn sb-header-cta" href="/#buscar" style={S.cta}>{T.accion}</a>
        </div>
      </header>
    </div>
  )
}

/** Macaw mark + "Sacbé" wordmark, linking home (a full page load, so the home page's kit starts fresh). */
export function Logo() {
  return (
    <a href="/" style={S.logo}>
      <MarcaGuacamaya size={26} />
      Sacbé
    </a>
  )
}

/** Footer of every inner page: the home footer's black band, shortened to the brand, © and credits. */
export function SiteFooter() {
  const { lang } = useLang()
  return (
    <footer className="sb-footer">
      <Logo />
      <span>© 2026 Sacbé</span>
      <a href="/creditos">{lang === 'es' ? 'Créditos de las fotos' : 'Photo credits'}</a>
    </footer>
  )
}

const S: Record<string, React.CSSProperties> = {
  pegado: { position: 'sticky', top: 0, zIndex: 200 },
  header: { background: 'var(--barra)', height: 72, display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '1.5rem', padding: '0 clamp(1rem, 4vw, 2.5rem)' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--tinta)' },
  links: { display: 'flex', alignItems: 'center', gap: '1rem', justifySelf: 'end' },
  cta: { display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 24px', borderRadius: 'var(--radio-btn)', background: 'var(--guacamaya)', color: 'var(--sobre-accion)', fontSize: '.95rem', fontWeight: 500, whiteSpace: 'nowrap' },
}
