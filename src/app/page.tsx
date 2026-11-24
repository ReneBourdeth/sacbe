import type { Metadata, Viewport } from 'next'
import InicioCliente from './InicioCliente'
import { TEXTOS } from './inicio-textos'

export const metadata: Metadata = {
  title: TEXTOS.es.meta.titulo,
  description: TEXTOS.es.meta.descripcion,
  openGraph: { title: TEXTOS.es.meta.titulo, description: 'Salidas diarias desde L 120, con el boleto y su QR en tu teléfono.', type: 'website', locale: 'es_HN' },
  twitter: { card: 'summary_large_image' },
  // the taste skill's checks read the kind from these
  other: { 'site-kind': 'software', 'page-type': 'software' },
}

export const viewport: Viewport = { themeColor: '#0a0d14' }

// The kit's head line (the hero's entrance guard) is in the root layout's <head>.
export default function HomePage() {
  return <InicioCliente />
}
