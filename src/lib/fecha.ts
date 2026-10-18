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
