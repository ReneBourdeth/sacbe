// Date/time helpers. Every trip happens in Honduras, so times are always shown
// in Honduras time — never in the viewer's own timezone (a user in the US would
// otherwise see an 8 PM departure as 10 PM).

export const ZONA_HONDURAS = 'America/Tegucigalpa'

/** Honduras is UTC-6 all year (no daylight saving), so the offset never changes. */
export const OFFSET_HONDURAS = '-06:00'

/** Today's date in Honduras as YYYY-MM-DD (the format <input type="date"> uses). */
export function hoyHonduras() {
  // 'en-CA' formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HONDURAS }).format(new Date())
}

/** A Honduras date (YYYY-MM-DD) + time (HH:MM) as an exact timestamp for the database. */
export function instanteHonduras(fecha: string, hora: string) {
  return `${fecha}T${hora}:00${OFFSET_HONDURAS}`
}

/** "20:11": 24-hour time in Honduras, the format <input type="time"> uses. */
export function hora24Honduras(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: ZONA_HONDURAS }).format(new Date(iso))
}

/** "2026-11-02": the Honduras calendar day of a timestamp. */
export function diaHonduras(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HONDURAS }).format(new Date(iso))
}

/** First and last day (YYYY-MM-DD) of the month that `dia` falls in. */
export function mesDe(dia: string) {
  const [anio, mes] = dia.split('-').map(Number)
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate() // day 0 of next month = last day of this one
  return { desde: `${dia.slice(0, 7)}-01`, hasta: `${dia.slice(0, 7)}-${String(ultimo).padStart(2, '0')}` }
}

/** "08:11 p. m." / "08:11 PM" */
export function formatoHora(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: ZONA_HONDURAS })
}

/** "15 oct 2026, 8:11 p. m." */
export function formatoFechaHora(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONA_HONDURAS })
}

/** "jueves, 15 de octubre" for a YYYY-MM-DD date. */
export function formatoDia(fecha: string, locale: string) {
  // Noon avoids the date shifting by a day when converted between timezones
  return new Date(`${fecha}T12:00:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
}
