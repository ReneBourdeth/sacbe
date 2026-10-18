'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, type Boleto } from '@/lib/supabase'
import { getMisBoletos } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { formatoFechaHora } from '@/lib/fecha'
import { qrComoImagen } from '@/lib/qr'
import SiteHeader from '@/components/SiteHeader'

// Shape returned by getMisBoletos: a ticket joined with its trip, route and seat.
// Joined parts can be null when RLS hides them (e.g. a trip that already left).
type BoletoFila = {
  id: string
  codigo_qr: string
  nombre_pasajero: string
  estado: Boleto['estado']
  precio_final: number
  viajes: {
    salida: string
    rutas: {
      empresas: { nombre: string } | null
      origen: { nombre: string } | null
      destino: { nombre: string } | null
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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.replace('/entrar?next=/mis-viajes')
      setEmail(user.email || '')
      const data = (await getMisBoletos(user.id).catch(() => null)) as unknown as BoletoFila[] | null
      if (!data) return setError(true)
      setBoletos(data)
      const imgs: Record<string, string> = {}
      for (const b of data) {
        imgs[b.id] = await qrComoImagen(b.codigo_qr, 140)
      }
      setQrs(imgs)
    })
  }, [router])

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
        <h1 style={S.title}>{t.misBoletos}</h1>

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
            <div key={b.id} style={S.card}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.ruta}>{r?.origen?.nombre ?? '—'} → {r?.destino?.nombre ?? '—'}</div>
                <div style={S.muted}>
                  {r?.empresas?.nombre}
                  {b.viajes && ` · ${formatoFechaHora(b.viajes.salida, locale)}`}
                </div>
                <div style={S.fila}><span>{t.asiento}</span><strong>{b.asientos?.numero}</strong></div>
                <div style={S.fila}><span>{t.pasajero}</span><span>{b.nombre_pasajero}</span></div>
                <div style={S.fila}><span>{t.codigo}</span><span style={{ fontFamily: 'monospace' }}>{b.codigo_qr}</span></div>
                <span style={{ ...S.estado, ...(b.estado === 'pagado' ? S.estadoOk : {}) }}>{t.estados[b.estado]}</span>
              </div>
              {qrs[b.id] && (
                <div style={{ background: 'white', padding: 8, alignSelf: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL */}
                  <img src={qrs[b.id]} alt="QR" width={110} height={110} style={{ display: 'block' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', position: 'relative', zIndex: 1 },
  email: { fontSize: '.9rem', color: 'var(--tenue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 },
  salir: { background: 'none', border: 'none', color: 'var(--tinta)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' },
  wrap: { maxWidth: 720, margin: '2rem auto', padding: '0 1.5rem 4rem' },
  title: { fontSize: '2.4rem', marginBottom: '1.25rem' },
  muted: { color: 'var(--tenue)', marginBottom: '.75rem' },
  empty: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12, padding: '3rem', textAlign: 'center', color: 'var(--tenue)' },
  btn: { display: 'inline-block', background: 'var(--guacamaya)', color: '#FFFFFF', borderRadius: 6, padding: '11px 22px', fontWeight: 700 },
  card: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', background: 'var(--superficie)', border: '1px solid var(--borde2)', borderTop: '5px solid var(--guacamaya)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  ruta: { fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 },
  fila: { display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '.95rem', marginBottom: 3, color: 'var(--tenue)' },
  estado: { display: 'inline-block', marginTop: '.5rem', fontSize: '.9rem', fontWeight: 500, padding: '2px 12px', borderRadius: 999, background: 'var(--hundido)', color: 'var(--tinta)' },
  estadoOk: { background: '#DCEEDF', color: 'var(--verde)' },
}
