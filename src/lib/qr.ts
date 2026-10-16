import QRCode from 'qrcode'

/**
 * Draws a ticket's QR code as an image (data: URL) right in the browser.
 * Done locally on purpose: sending ticket codes to an online QR service
 * would leak them to a third party.
 */
export function qrComoImagen(codigo: string, tamano = 180) {
  return QRCode.toDataURL(codigo, { width: tamano, margin: 0, color: { dark: '#0C0B09', light: '#FFFFFF' } })
}
