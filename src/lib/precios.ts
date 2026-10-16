// Sacbé's service fee per ticket, in lempiras (HNL).
// Only used for display for now; when real payments arrive (Sprint 2),
// the server must compute the total itself and never trust the browser.
export const CARGO_SERVICIO = 15

export function totalConCargo(precio: number) {
  return precio + CARGO_SERVICIO
}
