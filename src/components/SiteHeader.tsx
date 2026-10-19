import Link from 'next/link'
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
      <div className="sb-plumas" />
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

/** Macaw mark + "Sacbé" wordmark, linking home. */
export function Logo() {
  return (
    <Link href="/" style={S.logo}>
      <MarcaGuacamaya size={26} />
      Sacbé
    </Link>
  )
}

const S: Record<string, React.CSSProperties> = {
  pegado: { position: 'sticky', top: 0, zIndex: 200 },
  header: { background: 'rgba(0, 0, 0, .92)', borderBottom: '1px solid var(--borde2)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', backdropFilter: 'blur(12px)' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--tinta)' },
  links: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
}
