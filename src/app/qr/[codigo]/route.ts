import QRCode from 'qrcode'

// /qr/SCB-7Q2K-M9XD-4TFA → the ticket's QR as a PNG, for the link in the WhatsApp message (a computer
// cannot share image files). Drawn here, never by an outside QR service, so codes stay with Sacbé.
// It reads no data: anyone with the link already has the code it draws.
export async function GET(_req: Request, { params }: { params: { codigo: string } }) {
  const codigo = decodeURIComponent(params.codigo)
  if (!/^SCB(-[A-Z0-9]{4}){3}$/.test(codigo)) return new Response('Not found', { status: 404 })
  const png = await QRCode.toBuffer(codigo, { width: 600, margin: 2, color: { dark: '#0C0B09', light: '#FFFFFF' } })
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
