'use client'

import SiteHeader from '@/components/SiteHeader'
import { useLang } from '@/lib/i18n'
import { FOTOS } from '@/lib/fotos'

/** /creditos: every photograph on the home page with its author and licence (CC BY needs the credit). */
export default function CreditosPage() {
  const { lang } = useLang()
  return (
    <main style={{ minHeight: '100vh' }}>
      <SiteHeader />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 className="sb-titulo-pagina" style={{ marginBottom: '1.5rem' }}>{lang === 'es' ? 'Créditos de las fotografías' : 'Photograph credits'}</h1>
        <ul style={{ display: 'grid', listStyle: 'none', background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 'var(--radio)', padding: '.5rem 1.5rem', backdropFilter: 'blur(12px)' }}>
          {Object.values(FOTOS).map(f => (
            <li key={f.pagina + f.lugar} style={{ padding: '1rem 0', borderBottom: '1px solid var(--borde2)' }}>
              <a href={`https://commons.wikimedia.org/wiki/${f.pagina}`} style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>{f.lugar}</a>
              <span style={{ color: 'var(--tenue)' }}> · {f.autor} · {f.lic} · Wikimedia Commons</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
