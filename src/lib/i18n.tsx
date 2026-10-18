'use client'

// Spanish/English text for the whole site.
// Usage in a component:  const { t, locale } = useLang();  then  {t.buscar}
// To add text: add the same key to BOTH `es` and `en` below — TypeScript will
// complain if one language is missing a key that the other has.

import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'es' | 'en'

const dict = {
  es: {
    tagline: 'Sacbé significa “camino blanco” en maya',
    heroA: 'Del Caribe a Copán, en un solo boleto',
    heroB: 'Elige tu bus y tu asiento, y lleva el boleto en tu teléfono.',
    ilustracion: 'Una guacamaya roja sobre un templo maya de Copán, con el camino blanco al frente',
    origen: 'Origen',
    destino: 'Destino',
    fecha: 'Fecha',
    buscar: 'Buscar buses',
    intercambiar: 'Intercambiar origen y destino',
    cerrar: 'Cerrar',
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
    continuar: 'Continuar',
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
    entrar: 'Entrar',
    salir: 'Salir',
    misBoletos: 'Mis boletos',
    tituloEntrar: 'Accede a tu cuenta',
    subEntrar: 'Te enviaremos un enlace a tu correo para entrar. Si no tienes cuenta, se crea sola.',
    correo: 'Correo electrónico',
    enviarCodigo: 'Enviar enlace',
    enviando: 'Enviando...',
    codigoEnviado: (e: string) => `Enviamos un enlace a ${e}. Ábrelo en este mismo navegador. Revisa también tu carpeta de spam.`,
    oCodigo: 'Si tu correo trae un código, escríbelo aquí:',
    errorEnlace: 'El enlace no es válido o ya venció.',
    intentarDeNuevo: 'Intentar de nuevo',
    codigo6: 'Código',
    verificar: 'Entrar',
    verificando: 'Verificando...',
    cambiarCorreo: 'Usar otro correo',
    errorEnvio: 'No pudimos enviar el código. Espera un momento e intenta de nuevo.',
    errorCodigo: 'Código incorrecto o vencido.',
    sinBoletos: 'Aún no tienes boletos.',
    buscarViaje: 'Buscar un viaje',
    loginHint: 'Inicia sesión para guardar este boleto en tu cuenta.',
    estados: { reservado: 'Reservado', pagado: 'Pagado', usado: 'Usado', cancelado: 'Cancelado', expirado: 'Expirado' },
  },
  en: {
    tagline: 'Sacbé means “white road” in Maya',
    heroA: 'From the Caribbean to Copán, on one ticket',
    heroB: 'Pick your bus and seat, and carry the ticket on your phone.',
    ilustracion: 'A scarlet macaw on a Maya temple at Copán, with the white road in front',
    origen: 'From',
    destino: 'To',
    fecha: 'Date',
    buscar: 'Search buses',
    intercambiar: 'Swap origin and destination',
    cerrar: 'Close',
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
    continuar: 'Continue',
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
    entrar: 'Sign in',
    salir: 'Sign out',
    misBoletos: 'My tickets',
    tituloEntrar: 'Sign in to your account',
    subEntrar: "We'll email you a sign-in link. No account yet? One is created automatically.",
    correo: 'Email',
    enviarCodigo: 'Send link',
    enviando: 'Sending...',
    codigoEnviado: (e: string) => `We sent a link to ${e}. Open it in this same browser. Check your spam folder too.`,
    oCodigo: 'If your email has a code, type it here:',
    errorEnlace: 'This link is invalid or has expired.',
    intentarDeNuevo: 'Try again',
    codigo6: 'Code',
    verificar: 'Sign in',
    verificando: 'Verifying...',
    cambiarCorreo: 'Use a different email',
    errorEnvio: "We couldn't send the code. Wait a moment and try again.",
    errorCodigo: 'Wrong or expired code.',
    sinBoletos: "You don't have any tickets yet.",
    buscarViaje: 'Find a trip',
    loginHint: 'Sign in to save this ticket to your account.',
    estados: { reservado: 'Reserved', pagado: 'Paid', usado: 'Used', cancelado: 'Cancelled', expirado: 'Expired' },
  },
} satisfies Record<Lang, Record<string, unknown>>

export type Dict = typeof dict.es

// `locale` is for number/date formatting (es-HN or en-US)

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

/** Current language, its texts (`t`) and a setter. */
export function useLang() {
  return useContext(LangContext)
}
