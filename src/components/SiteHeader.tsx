import Link from 'next/link'
import AuthLink from './AuthLink'
import LangToggle from './LangToggle'

/**
 * Top bar used on every inner page: logo on the left, sign-in link and
 * language switch on the right. Pages can put extra links before those
 * via `children` (e.g. "Change search" on the results page).
 */
export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sb-header" style={S.header}>
      <Link href="/" style={S.logo}>SAC<span style={{ color: 'var(--dorado)' }}>BÉ</span></Link>
      <nav className="sb-header-links" style={S.links}>
        {children}
        <AuthLink />
        <LangToggle />
      </nav>
    </header>
  )
}

const S: Record<string, React.CSSProperties> = {
  header: { background: 'rgba(12,11,9,.9)', borderBottom: '1px solid var(--borde)', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(20px)' },
  logo: { fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blanco)', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '1rem' },
}
