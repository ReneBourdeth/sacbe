'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'es' | 'en'

const dict = {
  es: {
    tagline: '🇭🇳 Plataforma Nacional de Transporte',
    heroA: 'Conectando destinos,',
    heroB: 'uniendo personas',
    origen: 'Origen',
    destino: 'Destino',
    fecha: 'Fecha',
    buscar: 'Buscar →',
    footer: 'Sacbé — Conectando destinos, uniendo personas.',
    origenDestinoIguales: 'Origen y destino deben ser distintos',

    buscando: 'Buscando viajes...',
    cargando: 'Cargando...',
    errorViajes: 'Error al cargar viajes',
    cambiarBusqueda: '← Cambiar búsqueda',
    editar: 'Editar',
    todos: 'Todos',
    economica: 'Económica',
    ejecutivo: 'Ejecutivo',
    primera: 'Primera',
    sinResultados: 'Sin resultados',
    otraFecha: 'Intenta con otra fecha',
    asientosPocos: (n: number) => `⚠ ${n} asientos`,
    asientosDisp: (n: number) => `✓ ${n} disp.`,
    elegido: '✓ Elegido',
    elegir: 'Elegir',
    tuSeleccion: 'Tu selección',
    seleccionaViaje: 'Selecciona un viaje',
    boleto: 'Boleto',
    cargoServicio: 'Cargo servicio',
    total: 'Total',
    comprarBoleto: 'Comprar boleto',

    paso: (n: number) => `Paso ${n} de 3`,
    seleccionaAsiento: 'Selecciona tu asiento',
    frente: 'Frente',
    cargandoAsientos: 'Cargando asientos...',
    sinAsientos: 'Este viaje no tiene asientos disponibles.',
    continuar: 'Continuar →',
    atras: '← Atrás',
    alertAsiento: 'Selecciona un asiento',
    datosPasajero: 'Datos del pasajero',
    asiento: 'Asiento',
    esMenor: 'Pasajero es menor de edad',
    nombreCompleto: 'Nombre completo',
    identidad: 'Identidad / Pasaporte',
    telefono: 'Teléfono',
    alertDatos: 'Completa los datos',
    metodoPago: 'Método de pago',
    tarjeta: 'Tarjeta',
    efectivo: 'Efectivo',
    numTarjeta: 'Número de tarjeta',
    vencimiento: 'Vencimiento',
    vencPlaceholder: 'MM/AA',
    efectivoInfoA: 'Recibirás un código para pagar en puntos',
    boletoAsiento: (n: string) => `Boleto asiento ${n}`,
    cargoPorServicio: 'Cargo por servicio',
    procesando: 'Procesando...',
    confirmarPagar: '🔒 Confirmar y pagar',
    errorCompra: 'Error procesando la compra. Intenta de nuevo.',
    asientoOcupado: 'Ese asiento acaba de ser tomado. Elige otro.',
    boletoConfirmado: 'Boleto confirmado',
    caminoBlanco: 'Tu camino blanco comienza aquí.',
    empresa: 'Empresa',
    ruta: 'Ruta',
    salida: 'Salida',
    pasajero: 'Pasajero',
    codigo: 'Código',
    whatsapp: '📲 Enviar por WhatsApp',
    whatsappMsg: 'Mi boleto Sacbé ✦',
    verBoletos: 'Ver mis boletos',
  },
  en: {
    tagline: '🇭🇳 National Transportation Platform',
    heroA: 'Connecting destinations,',
    heroB: 'bringing people together',
    origen: 'From',
    destino: 'To',
    fecha: 'Date',
    buscar: 'Search →',
    footer: 'Sacbé — Connecting destinations, bringing people together.',
    origenDestinoIguales: 'Origin and destination must be different',

    buscando: 'Searching trips...',
    cargando: 'Loading...',
    errorViajes: 'Error loading trips',
    cambiarBusqueda: '← Change search',
    editar: 'Edit',
    todos: 'All',
    economica: 'Economy',
    ejecutivo: 'Executive',
    primera: 'First class',
    sinResultados: 'No results',
    otraFecha: 'Try another date',
    asientosPocos: (n: number) => `⚠ ${n} seats left`,
    asientosDisp: (n: number) => `✓ ${n} available`,
    elegido: '✓ Selected',
    elegir: 'Select',
    tuSeleccion: 'Your selection',
    seleccionaViaje: 'Select a trip',
    boleto: 'Ticket',
    cargoServicio: 'Service fee',
    total: 'Total',
    comprarBoleto: 'Buy ticket',

    paso: (n: number) => `Step ${n} of 3`,
    seleccionaAsiento: 'Choose your seat',
    frente: 'Front',
    cargandoAsientos: 'Loading seats...',
    sinAsientos: 'This trip has no seats available.',
    continuar: 'Continue →',
    atras: '← Back',
    alertAsiento: 'Please choose a seat',
    datosPasajero: 'Passenger details',
    asiento: 'Seat',
    esMenor: 'Passenger is a minor',
    nombreCompleto: 'Full name',
    identidad: 'ID / Passport',
    telefono: 'Phone',
    alertDatos: 'Please complete all fields',
    metodoPago: 'Payment method',
    tarjeta: 'Card',
    efectivo: 'Cash',
    numTarjeta: 'Card number',
    vencimiento: 'Expiry',
    vencPlaceholder: 'MM/YY',
    efectivoInfoA: "You'll get a code to pay at",
    boletoAsiento: (n: string) => `Ticket, seat ${n}`,
    cargoPorServicio: 'Service fee',
    procesando: 'Processing...',
    confirmarPagar: '🔒 Confirm and pay',
    errorCompra: 'Error processing the purchase. Please try again.',
    asientoOcupado: 'That seat was just taken. Please choose another.',
    boletoConfirmado: 'Ticket confirmed',
    caminoBlanco: 'Your white road begins here.',
    empresa: 'Company',
    ruta: 'Route',
    salida: 'Departure',
    pasajero: 'Passenger',
    codigo: 'Code',
    whatsapp: '📲 Send via WhatsApp',
    whatsappMsg: 'My Sacbé ticket ✦',
    verBoletos: 'View my tickets',
  },
} satisfies Record<Lang, Record<string, unknown>>

export type Dict = typeof dict.es

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict; locale: string }>({
  lang: 'es', setLang: () => {}, t: dict.es, locale: 'es-HN',
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  // Restore saved choice after first render (avoids hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sacbe-lang')
      if (saved === 'en' || saved === 'es') setLangState(saved)
    } catch {}
  }, [])

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem('sacbe-lang', l) } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: dict[lang], locale: lang === 'es' ? 'es-HN' : 'en-US' }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// ── ES | EN switch
export function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()
  const btn = (l: Lang): React.CSSProperties => ({
    background: lang === l ? '#C9A84C' : 'transparent',
    color: lang === l ? '#0C0B09' : '#C8BFB0',
    border: 'none', padding: '4px 9px', fontSize: '.62rem', letterSpacing: 1.5, cursor: 'pointer',
  })
  return (
    <div style={{ display: 'inline-flex', border: '1px solid rgba(201,168,76,.3)', ...style }} aria-label="Language">
      <button style={btn('es')} onClick={() => setLang('es')}>ES</button>
      <button style={btn('en')} onClick={() => setLang('en')}>EN</button>
    </div>
  )
}
