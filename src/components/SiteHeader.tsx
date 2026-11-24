import AuthLink from './AuthLink'
import LangToggle from './LangToggle'
import { MarcaGuacamaya } from './Simbolos'

/**
 * Top bar used on every inner page: logo on the left, sign-in link and
 * language switch on the right. Pages can put extra links before those
 * via `children` (e.g. "Change search" on the results page).
 */
export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div style={S.pegado}>
      <header className="sb-header" style={S.header}>
        <Logo />
        <nav className="sb-header-links" style={S.links}>
          {children}
          <AuthLink />
          <LangToggle />
        </nav>
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

const S: Record<string, React.CSSProperties> = {
  pegado: { position: 'sticky', top: 0, zIndex: 200 },
  header: { background: 'rgba(0, 0, 0, .6)', borderBottom: '1px solid var(--borde2)', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--tinta)' },
  links: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
}
