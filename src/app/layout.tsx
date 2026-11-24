import type { Metadata } from 'next'
import '../styles/globals.css'
import { LangProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Sacbé: boletos de bus en Honduras',
  description: 'Busca salidas entre seis ciudades de Honduras, elige tu asiento y lleva el boleto con QR en el teléfono.',
  keywords: ['bus', 'honduras', 'boletos', 'transporte', 'san pedro sula'],
  openGraph: {
    title: 'Sacbé',
    description: 'Boletos de bus entre seis ciudades de Honduras.',
    locale: 'es_HN',
    type: 'website',
  },
}

const KIT_HEAD = `try{if(localStorage.getItem('sacbe-tema')==='claro')document.documentElement.dataset.tema='claro'}catch(e){}if(location.pathname==='/'){var h=document.documentElement;h.dataset.type='software';h.dataset.radius='round';h.dataset.buttons='tonal';h.dataset.ground='sky';h.setAttribute('data-motion','');document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700);document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the home page sets the kit's flags on <html> before React starts
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* the pairing the taste skill dealt (red-hat), from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- one font link for every page, in the root layout */}
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400..900&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {/* the taste skill's head line, home page only: the kit's page flags, and the hero's entrance guard
            (its words wait for motion.js, or show after 700 ms if it is late); the moments' guard the same way */}
        <script dangerouslySetInnerHTML={{ __html: KIT_HEAD }} />
      </head>
      <body><LangProvider>{children}</LangProvider></body>
    </html>
  )
}
