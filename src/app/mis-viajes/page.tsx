'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, type Boleto } from '@/lib/supabase'
import { cancelarBoleto, getMisBoletos } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { formatoFechaHora } from '@/lib/fecha'
import { qrComoImagen } from '@/lib/qr'
import { nombreTerminal } from '@/lib/terminales'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'

// Shape returned by getMisBoletos: a ticket joined with its trip, route and seat.
// Joined parts can be null when RLS hides them (e.g. a trip that already left).
type BoletoFila = {
  id: string
  codigo_qr: string
  nombre_pasajero: string
  estado: Boleto['estado']
  precio_final: number
  reembolso: number | null         // refund owed after cancelling a paid ticket
  reembolsado_at: string | null    // when the company paid it back
  viajes: {
    salida: string
    rutas: {
      empresas: { nombre: string } | null
      origen: { nombre: string; codigo: string } | null
      destino: { nombre: string; codigo: string } | null
    } | null
  } | null
  asientos: { numero: string } | null
}

/** /mis-viajes — the signed-in user's tickets with their QR codes. Logged-out users are sent to sign in. */
export default function MisViajesPage() {
  const router = useRouter()
  const { t, locale } = useLang()
  const [boletos, setBoletos] = useState<BoletoFila[] | null>(null)
  const [error, setError] = useState(false)
  const [qrs, setQrs] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [porConfirmar, setPorConfirmar] = useState<string | null>(null) // guest who hasn't confirmed their email yet
  const [recarga, setRecarga] = useState(0) // bump to reload after a cancel

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.replace('/entrar?next=/mis-viajes')
      setEmail(user.email || '')
      if (user.is_anonymous) setPorConfirmar(user.new_email ?? '')
      const data = (await getMisBoletos(user.id).catch(() => null)) as unknown as BoletoFila[] | null
      if (!data) return setError(true)
      setBoletos(data)
      const imgs: Record<string, string> = {}
      for (const b of data) {
        imgs[b.id] = await qrComoImagen(b.codigo_qr, 140)
      }
      setQrs(imgs)
    })
  }, [router, recarga])

  async function cancelar(b: BoletoFila) {
    if (!confirm(t.confirmarCancelar)) return
    try {
      const reembolso = await cancelarBoleto(b.id)
      alert(reembolso > 0 ? t.canceladoConReembolso(reembolso) : t.cancelado)
      setRecarga(n => n + 1)
    } catch {
      alert(t.errorCancelar)
    }
  }

  async function salir() {
    await createClient().auth.signOut()
    router.replace('/')
  }

  return (
    <main style={S.main}>
      <SiteHeader>
        {email && <span className="sb-hide-sm" style={S.email}>{email}</span>}
        {email && <button style={S.salir} onClick={salir}>{t.salir}</button>}
      </SiteHeader>

      <div style={S.wrap}>
        <h1 className="sb-titulo-pagina" style={S.title}>{t.misBoletos}</h1>
        {porConfirmar !== null && <p style={S.aviso}>{porConfirmar ? `✉ ${t.confirmaCorreo(porConfirmar)}` : `📲 ${t.invitadoSinCorreo}`}</p>}

        {error ? (
          <p style={S.muted}>{t.errorViajes} · <a href="/mis-viajes" style={{ color: 'var(--turquesa)', textDecoration: 'underline' }}>{t.intentarDeNuevo}</a></p>
        ) : boletos === null ? (
          <p style={S.muted}>{t.cargando}</p>
        ) : boletos.length === 0 ? (
          <div style={S.empty}>
            <p style={{ marginBottom: '1rem' }}>{t.sinBoletos}</p>
            <a href="/" className="sb-btn" style={S.btn}>{t.buscarViaje}</a>
          </div>
        ) : boletos.map(b => {
          const r = b.viajes?.rutas
          return (
            // the receipt look of the home page's drawn tickets: route and state, the rows, the QR beside
            <div key={b.id} className="tk">
              <div className="tk-info">
                <div className="tk-head">
                  <b>{t.reserva} {b.codigo_qr}</b>
                  <span className={`vv-chip${b.estado === 'reservado' ? ' is-pocos' : b.estado === 'pagado' ? '' : ' is-off'}`}>{t.estados[b.estado]}</span>
                </div>
                <small>{r?.empresas?.nombre}{b.viajes && ` · ${formatoFechaHora(b.viajes.salida, locale)}`}</small>
                <small>{nombreTerminal(r?.origen?.codigo ?? '')} → {nombreTerminal(r?.destino?.codigo ?? '')}</small>
                <dl className="tk-filas">
                  <div><dt>{t.asiento}</dt><dd><strong>{b.asientos?.numero}</strong></dd></div>
                  <div><dt>{t.pasajero}</dt><dd>{b.nombre_pasajero}</dd></div>
                  <div className="tk-total"><dt>{t.boleto}</dt><dd>L {Number(b.precio_final)}</dd></div>
                </dl>
                {b.estado === 'cancelado' && Number(b.reembolso) > 0 && (
                  <p style={S.muted}>{b.reembolsado_at ? t.reembolsoHecho(Number(b.reembolso)) : t.reembolsoPendiente(Number(b.reembolso))}</p>
                )}
                {(b.estado === 'reservado' || b.estado === 'pagado') && b.viajes && new Date(b.viajes.salida) > new Date() && (
                  <button style={S.cancelar} onClick={() => cancelar(b)}>{t.cancelarBoleto}</button>
                )}
              </div>
              {qrs[b.id] && b.estado !== 'cancelado' && ( // a cancelled ticket can't board, so don't offer its QR
                <div className="tk-qr">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL */}
                  <img src={qrs[b.id]} alt={`QR ${b.codigo_qr}`} width={128} height={128} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <SiteFooter />
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', position: 'relative', zIndex: 1 },
  email: { fontSize: '.9rem', color: 'var(--tenue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 },
  cancelar: { display: 'block', marginTop: '.75rem', background: 'none', border: '1px solid var(--rojo)', color: 'var(--rojo)', borderRadius: 'var(--radio-btn)', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' },
  salir: { background: 'none', border: 'none', color: 'var(--tinta)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' },
  wrap: { maxWidth: 720, margin: '2rem auto', padding: '0 1.5rem 4rem' },
  title: { marginBottom: '1.5rem' },
  muted: { color: 'var(--tenue)', marginBottom: '.75rem' },
  aviso: { background: 'var(--superficie)', border: '1px solid var(--amarillo)', borderRadius: 'var(--radio)', padding: '.875rem 1rem', marginBottom: '1.25rem' },
  empty: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 'var(--radio)', padding: '3rem', textAlign: 'center', color: 'var(--tenue)' },
  btn: { display: 'inline-block', background: 'var(--guacamaya)', borderRadius: 'var(--radio-btn)', color: 'var(--sobre-accion)', padding: '11px 22px', fontWeight: 600 },
  card: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 'var(--radio)', padding: '1.25rem', marginBottom: '1rem' },
  ruta: { fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-.03em' },
  fila: { display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '.95rem', marginBottom: 3, color: 'var(--tenue)' },
  estado: { display: 'inline-block', marginTop: '.5rem', fontSize: '.9rem', fontWeight: 500, padding: '2px 12px', borderRadius: 'var(--radio-btn)', background: 'var(--hundido)', color: 'var(--tinta)' },
  estadoOk: { background: 'rgba(74, 222, 128, .15)', color: 'var(--verde)' },
}
