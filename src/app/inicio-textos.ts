// Home page copy (ES/EN), written to the taste skill's copy rules: plain, every
// fact from the real data (routes, companies, departure times, prices in the
// database), no invented proof. Inner pages keep their texts in src/lib/i18n.tsx.

const es = {
  meta: {
    titulo: 'Sacbé: boletos de bus entre seis ciudades de Honduras',
    descripcion: 'Busca salidas, elige tu asiento en el mapa del bus y paga en efectivo en PagoExpress. Tu boleto llega con QR al teléfono.',
  },
  saltar: 'Saltar al contenido',
  nav: { asientos: 'Asientos', pago: 'Pago', rutas: 'Rutas', empresas: 'Empresas', preguntas: 'Preguntas', menu: 'Menú' },
  accion: 'Buscar buses',
  hero: {
    h1: 'Boletos de bus entre seis ciudades de Honduras',
    lead: 'Elige la salida, marca tu asiento en el mapa del bus y lleva el boleto con QR en el teléfono. Pagas en efectivo en PagoExpress.',
    prueba: 'Hedman Alas, Viana, El Rey Express, Cotuc y Saenz salen a las 6:00, 10:00, 14:00 y 18:00.',
    origen: 'Origen', destino: 'Destino', fecha: 'Fecha', intercambiar: 'Intercambiar origen y destino',
    arte: 'La lista de salidas de San Pedro Sula a Tegucigalpa, y un boleto reservado con su QR listo',
    ventana: 'Salidas', tarjeta: 'Boleto SCB-7Q2K', apartado: 'Asiento 4C apartado', pagar: 'Pagado en PagoExpress, L 457', qr: 'QR listo para abordar', listo: 'Listo',
  },
  app: {
    h2: 'El mapa de asientos de cada bus',
    p: 'La lista muestra las salidas del día con empresa, clase y precio. Abres una y ves sus 40 asientos: los ocupados en gris, los tuyos en rojo.',
    link: 'Ver salidas a Tegucigalpa',
    arte: 'La ventana de Sacbé con doce salidas de San Pedro Sula a Tegucigalpa y el mapa de asientos de la de Viana a las 10:00',
    cols: ['Empresa', 'Salida', 'Clase', 'Precio'],
    libres: 'disp.', libre: 'Libre', ocupado: 'Ocupado', tuyo: 'Tuyo', frente: 'Frente', continuar: 'Continuar', resumen: '2 asientos · L 914',
  },
  pago: {
    h2: 'Paga en efectivo en PagoExpress',
    p: 'Al reservar, cada asiento queda apartado con su código. Pagas en una agencia PagoExpress y la empresa de buses marca tu boleto como pagado.',
    datos: ['Hasta 6 asientos en una compra', 'Sin cuenta: solo tu correo para la confirmación', 'Cargo por servicio de L 15 por boleto'],
    link: 'Leer las preguntas sobre pagos',
    arte: 'Una reserva de dos asientos que pasa de pendiente a pagada',
    reserva: 'Reserva', pendiente: 'Pendiente', pagado: 'Pagado', asientos: 'Asientos', total: 'Total', viaje: 'Viana · mar 10 nov · 10:00',
  },
  rutas: {
    h2: 'Rutas y precios',
    p: 'Seis ciudades conectadas en los dos sentidos. Roatán no tiene buses: el ferry sale de La Ceiba.',
    desde: 'desde',
    elige: 'Toca una ciudad para salir de ahí',
    eligeDestino: (c: string) => `Desde ${c}: ahora toca el destino`,
    ver: 'Ver buses',
    cambiar: 'Invertir',
    quitar: 'Quitar',
    alt: 'Sacbé al centro y las seis ciudades alrededor, cada una con su tarifa más baja: Tegucigalpa y Comayagua desde L 120, Choluteca desde L 200, San Pedro Sula desde L 180, La Ceiba desde L 250 y Copán Ruinas desde L 300.',
  },
  pasos: {
    h2: 'Del asiento al bus en 3 pasos',
    tarjetas: [
      { h3: 'Reserva tus asientos', p: 'Eliges hasta seis y escribes el nombre e identidad de cada pasajero.' },
      { h3: 'Paga tu boleto', p: 'En efectivo en PagoExpress. La empresa confirma el pago y el boleto pasa a pagado.' },
      { h3: 'Muestra el QR al abordar', p: 'El personal escanea el código en la puerta. Cada boleto entra una sola vez.' },
    ],
    pasajero: 'Pasajero', identidad: 'Identidad', abordo: 'Abordó', escaneado: 'Boleto válido',
  },
  ciudades: {
    h2a: 'Seis ciudades,', h2b: 'un boleto',
    p: 'De las ruinas de Copán a la costa de La Ceiba, con el boleto en tu teléfono y el pago en efectivo.',
    link: 'Ver rutas y precios',
  },
  creditos: 'Fotografías vía Wikimedia Commons',
  empresas: {
    h2: 'Panel para empresas de buses.',
    gris: 'Pasajeros, abordaje, horarios e ingresos.',
    link: 'Entrar al panel',
    tarjetas: [
      { h3: 'Ve la lista de pasajeros', p: 'Cada salida muestra quién viaja, en qué asiento y si ya pagó.' },
      { h3: 'Escanea el QR al abordar', p: 'La cámara lee el boleto y avisa si no está pagado o si ya se usó.' },
      { h3: 'Agrega salidas y precios', p: 'Creas rutas y horarios; los 40 asientos de cada bus se crean solos.' },
      { h3: 'Lee los ingresos por ruta', p: 'Boletos pagados y pendientes entre dos fechas, ruta por ruta.' },
    ],
    pagado: 'Pagado', pendiente: 'Pendiente', valido: 'Válido', usado: 'Ya usado', nueva: 'Nueva salida', ingresos: 'Ingresos de noviembre', hora: 'Hora', precio: 'Precio',
  },
  faq: {
    h2: 'Preguntas',
    p: 'Sobre compras, pagos y abordaje.',
    link: 'Escribir a soporte',
    items: [
      { q: '¿Necesito una cuenta para comprar?', a: 'No. Compras con tu correo y te llega la confirmación. Al abrirla, tus boletos quedan guardados en una cuenta.' },
      { q: '¿Cómo pago mi boleto?', a: 'En efectivo en una agencia PagoExpress, con tu código de reserva: el precio del boleto más L 15 de servicio.' },
      { q: '¿Puedo cancelar un boleto?', a: 'Sí, desde Mis boletos antes de la salida. Si ya pagaste, la empresa te devuelve el precio del boleto.' },
      { q: '¿Cuántos asientos puedo comprar?', a: 'Hasta 6 por salida, con el nombre e identidad de cada pasajero.' },
      { q: '¿Cómo abordo el bus?', a: 'Muestra el QR de tu boleto en la puerta. El personal lo escanea y cada código entra una sola vez.' },
      { q: '¿Hay buses a Roatán?', a: 'No. Roatán es una isla: toma un bus a La Ceiba y desde ahí el ferry.' },
    ],
  },
  cierre: { h2: 'Compra tu boleto de bus', p: 'Salidas diarias desde L 120, con el QR en tu teléfono.' },
  pie: {
    lede: 'Boletos de bus para viajar dentro de Honduras.',
    cols: [
      { h: 'Viajar', links: [['Asientos', '#asientos'], ['Pago', '#pago'], ['Rutas', '#prices']] },
      { h: 'Boletos', links: [['Mis boletos', '/mis-viajes'], ['Entrar', '/entrar']] },
      { h: 'Empresas', links: [['Panel', '/panel'], ['Funciones', '#empresas']] },
      { h: 'Ayuda', links: [['Preguntas', '#faq'], ['Contacto', '#contact']] },
    ],
  },
}

type Textos = typeof es

const en: Textos = {
  meta: {
    titulo: 'Sacbé: bus tickets between six cities in Honduras',
    descripcion: 'Find departures, pick your seat on the bus map and pay cash at PagoExpress. Your ticket arrives on your phone with a QR code.',
  },
  saltar: 'Skip to content',
  nav: { asientos: 'Seats', pago: 'Payment', rutas: 'Routes', empresas: 'Companies', preguntas: 'Questions', menu: 'Menu' },
  accion: 'Search buses',
  hero: {
    h1: 'Bus tickets between six cities in Honduras',
    lead: 'Pick the departure, mark your seat on the bus map and carry the ticket on your phone with a QR code. You pay cash at PagoExpress.',
    prueba: 'Hedman Alas, Viana, El Rey Express, Cotuc and Saenz leave at 6:00, 10:00, 14:00 and 18:00.',
    origen: 'From', destino: 'To', fecha: 'Date', intercambiar: 'Swap origin and destination',
    arte: 'The list of departures from San Pedro Sula to Tegucigalpa, and a booked ticket with its QR ready',
    ventana: 'Departures', tarjeta: 'Ticket SCB-7Q2K', apartado: 'Seat 4C held', pagar: 'Paid at PagoExpress, L 457', qr: 'QR ready for boarding', listo: 'Ready',
  },
  app: {
    h2: 'The seat map of every bus',
    p: 'The list shows the day’s departures with company, class and price. Open one and you see its 40 seats: taken ones in grey, yours in red.',
    link: 'See departures to Tegucigalpa',
    arte: 'The Sacbé window with twelve departures from San Pedro Sula to Tegucigalpa and the seat map of the Viana bus at 10:00',
    cols: ['Company', 'Leaves', 'Class', 'Price'],
    libres: 'available', libre: 'Free', ocupado: 'Taken', tuyo: 'Yours', frente: 'Front', continuar: 'Continue', resumen: '2 seats · L 914',
  },
  pago: {
    h2: 'Pay cash at PagoExpress',
    p: 'When you book, each seat is held with its own code. You pay at a PagoExpress agency and the bus company marks your ticket as paid.',
    datos: ['Up to 6 seats in one purchase', 'No account: just your email for the confirmation', 'Service charge of L 15 per ticket'],
    link: 'Read the payment questions',
    arte: 'A booking of two seats going from pending to paid',
    reserva: 'Booking', pendiente: 'Pending', pagado: 'Paid', asientos: 'Seats', total: 'Total', viaje: 'Viana · Tue 10 Nov · 10:00',
  },
  rutas: {
    h2: 'Routes and prices',
    p: 'Six cities connected both ways. Roatán has no buses: the ferry leaves from La Ceiba.',
    desde: 'from',
    elige: 'Tap a city to leave from it',
    eligeDestino: (c: string) => `From ${c}: now tap where you’re going`,
    ver: 'See buses',
    cambiar: 'Swap',
    quitar: 'Clear',
    alt: 'Sacbé in the centre and the six cities around it, each with its lowest fare: Tegucigalpa and Comayagua from L 120, Choluteca from L 200, San Pedro Sula from L 180, La Ceiba from L 250 and Copán Ruinas from L 300.',
  },
  pasos: {
    h2: 'From seat to bus in 3 steps',
    tarjetas: [
      { h3: 'Book your seats', p: 'Pick up to six and write each passenger’s name and ID number.' },
      { h3: 'Pay for your ticket', p: 'Cash at PagoExpress. The company confirms the payment and the ticket turns to paid.' },
      { h3: 'Show the QR to board', p: 'Staff scan the code at the door. Each ticket gets in only once.' },
    ],
    pasajero: 'Passenger', identidad: 'ID number', abordo: 'Boarded', escaneado: 'Valid ticket',
  },
  ciudades: {
    h2a: 'Six cities,', h2b: 'one ticket',
    p: 'From the ruins at Copán to the coast at La Ceiba, with the ticket on your phone and the payment in cash.',
    link: 'See routes and prices',
  },
  creditos: 'Photographs via Wikimedia Commons',
  empresas: {
    h2: 'A panel for bus companies.',
    gris: 'Passengers, boarding, schedules and revenue.',
    link: 'Sign in to the panel',
    tarjetas: [
      { h3: 'See the passenger list', p: 'Each departure shows who travels, in which seat and whether they paid.' },
      { h3: 'Scan the QR at boarding', p: 'The camera reads the ticket and warns when it is unpaid or already used.' },
      { h3: 'Add departures and prices', p: 'Create routes and times; the 40 seats of each bus are made for you.' },
      { h3: 'Read revenue by route', p: 'Paid and pending tickets between two dates, route by route.' },
    ],
    pagado: 'Paid', pendiente: 'Pending', valido: 'Valid', usado: 'Already used', nueva: 'New departure', ingresos: 'November revenue', hora: 'Time', precio: 'Price',
  },
  faq: {
    h2: 'Questions',
    p: 'About buying, paying and boarding.',
    link: 'Email support',
    items: [
      { q: 'Do I need an account to buy?', a: 'No. You buy with your email and get a confirmation. Open it and your tickets are kept in an account.' },
      { q: 'How do I pay for my ticket?', a: 'Cash at a PagoExpress agency, with your booking code: the ticket price plus L 15 service.' },
      { q: 'Can I cancel a ticket?', a: 'Yes, from My tickets before departure. If you already paid, the company refunds the ticket price.' },
      { q: 'How many seats can I buy?', a: 'Up to 6 per departure, with each passenger’s name and ID number.' },
      { q: 'How do I board the bus?', a: 'Show your ticket’s QR at the door. Staff scan it and each code gets in only once.' },
      { q: 'Are there buses to Roatán?', a: 'No. Roatán is an island: take a bus to La Ceiba and the ferry from there.' },
    ],
  },
  cierre: { h2: 'Buy your bus ticket', p: 'Daily departures from L 120, with the QR on your phone.' },
  pie: {
    lede: 'Bus tickets for travelling within Honduras.',
    cols: [
      { h: 'Travel', links: [['Seats', '#asientos'], ['Payment', '#pago'], ['Routes', '#prices']] },
      { h: 'Tickets', links: [['My tickets', '/mis-viajes'], ['Sign in', '/entrar']] },
      { h: 'Companies', links: [['Panel', '/panel'], ['Features', '#empresas']] },
      { h: 'Help', links: [['Questions', '#faq'], ['Contact', '#contact']] },
    ],
  },
}

export const TEXTOS = { es, en }

// Real rows from the database (tomorrow's SPS → TGU departures), used in the drawn app window.
export const SALIDAS = [
  { empresa: 'Hedman Alas', hora: '06:00', clase: 'economica', precio: 380 },
  { empresa: 'Viana', hora: '06:00', clase: 'economica', precio: 340 },
  { empresa: 'El Rey Express', hora: '06:00', clase: 'economica', precio: 300 },
  { empresa: 'Hedman Alas', hora: '10:00', clase: 'ejecutivo', precio: 494 },
  { empresa: 'Viana', hora: '10:00', clase: 'ejecutivo', precio: 442 },
  { empresa: 'El Rey Express', hora: '10:00', clase: 'ejecutivo', precio: 390 },
  { empresa: 'Hedman Alas', hora: '14:00', clase: 'economica', precio: 380 },
  { empresa: 'Viana', hora: '14:00', clase: 'economica', precio: 340 },
  { empresa: 'El Rey Express', hora: '14:00', clase: 'economica', precio: 300 },
  { empresa: 'Hedman Alas', hora: '18:00', clase: 'primera', precio: 646 },
  { empresa: 'Viana', hora: '18:00', clase: 'primera', precio: 578 },
  { empresa: 'El Rey Express', hora: '18:00', clase: 'primera', precio: 510 },
] as const

// Lowest economy price per city pair (both directions cost the same), from the database.
export const RUTAS = [
  ['TGU', 'CMG', 120], ['SPS', 'CMG', 180], ['TGU', 'CHO', 200], ['SPS', 'CEI', 250],
  ['CMG', 'CHO', 260], ['SPS', 'CPN', 300], ['SPS', 'TGU', 300], ['CEI', 'CMG', 330],
  ['CMG', 'CPN', 380], ['SPS', 'CHO', 450], ['TGU', 'CEI', 470], ['CEI', 'CPN', 500],
  ['TGU', 'CPN', 520], ['CEI', 'CHO', 600], ['CPN', 'CHO', 620],
] as const
