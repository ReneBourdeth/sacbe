import type { Metadata } from 'next'
import { Alegreya, Alegreya_Sans } from 'next/font/google'
import '../styles/globals.css'
import { LangProvider } from '@/lib/i18n'

// Alegreya: a calligraphic serif by Latin American type designer Juan Pablo del Peral.
// Its carved, hand-made feel suits Maya stone; the sans sibling keeps the UI readable.
const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['500', '800'],
  variable: '--font-alegreya',
})

const alegreyaSans = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-alegreya-sans',
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
    <html lang="es" className={`${alegreya.variable} ${alegreyaSans.variable}`}>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  )
}
