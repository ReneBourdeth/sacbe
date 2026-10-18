// Bus terminals Sacbé serves. Codes match `terminales.codigo` in the database
// (see docs/schema.sql), so they can be used directly in search URLs and queries.
export const TERMINALES = [
  { codigo: 'SPS', nombre: 'San Pedro Sula' },
  { codigo: 'TGU', nombre: 'Tegucigalpa' },
  { codigo: 'CEI', nombre: 'La Ceiba' },
  { codigo: 'CMG', nombre: 'Comayagua' },
  { codigo: 'CHO', nombre: 'Choluteca' },
  { codigo: 'CPN', nombre: 'Copán Ruinas' },
  { codigo: 'ROA', nombre: 'Roatán' },
] as const

const NOMBRES: Record<string, string> = Object.fromEntries(TERMINALES.map(t => [t.codigo, t.nombre]))

/** City name for a terminal code, e.g. 'SPS' → 'San Pedro Sula'. Falls back to the code itself. */
export function nombreTerminal(codigo: string) {
  return NOMBRES[codigo] ?? codigo
}
