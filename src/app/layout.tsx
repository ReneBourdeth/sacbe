import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import '../styles/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Sacbé — Plataforma Nacional de Transporte',
  description: 'Conectando destinos, uniendo personas. Compra boletos de bus en Honduras.',
  keywords: ['bus', 'honduras', 'boletos', 'transporte', 'san pedro sula'],
  openGraph: {
    title: 'Sacbé',
    description: 'Conectando destinos, uniendo personas.',
    locale: 'es_HN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
