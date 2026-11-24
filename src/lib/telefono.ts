/**
 * A WhatsApp number as wa.me wants it (country code and digits only), or null if it does not look like one.
 * "9999-9999" (a Honduran number without its code) becomes "50499999999"; "+1 555 010 0000" stays international.
 */
export function numeroWhatsApp(entrada: string): string | null {
  const conMas = entrada.trim().startsWith('+')
  const digitos = entrada.replace(/\D/g, '')
  if (!conMas && digitos.length === 8) return `504${digitos}`        // Honduras: 8 digits, code added
  if (digitos.length >= 10 && digitos.length <= 15) return digitos   // already with its country code
  return null
}
