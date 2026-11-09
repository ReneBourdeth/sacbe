import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import '../styles/globals.css'
import { LangProvider } from '@/lib/i18n'

// Archivo: a heavy, wide grotesk for the big poster-style headlines and a
// readable UI. Variable font, so every weight comes in one file.
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo' })

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
    <html lang="es" className={archivo.variable}>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  )
}
