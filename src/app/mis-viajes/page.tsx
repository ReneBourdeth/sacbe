'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase'
import { getMisBoletos } from '@/lib/api'
import { useLang, LangToggle } from '@/lib/i18n'

const TZ = 'America/Tegucigalpa'

type BoletoFila = {
  id: string
  codigo_qr: string
  nombre_pasajero: string
  estado: 'reservado' | 'pagado' | 'usado' | 'cancelado' | 'expirado'
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

export default function MisViajesPage() {
  const router = useRouter()
  const { t, locale } = useLang()
  const [boletos, setBoletos] = useState<BoletoFila[] | null>(null)
  const [qrs, setQrs] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.replace('/entrar?next=/mis-viajes')
      setEmail(user.email || '')
      const data = ((await getMisBoletos(user.id)) || []) as unknown as BoletoFila[]
      setBoletos(data)
      const imgs: Record<string, string> = {}
      for (const b of data) {
        imgs[b.id] = await QRCode.toDataURL(b.codigo_qr, { width: 140, margin: 0, color: { dark: '#0C0B09', light: '#FFFFFF' } })
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
      <header className="sb-header" style={S.header}>
        <a href="/" style={S.logo}>SAC<span style={{ color: 'var(--dorado)' }}>BÉ</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {email && <span className="sb-hide-sm" style={S.email}>{email}</span>}
          {email && <button style={S.salir} onClick={salir}>{t.salir}</button>}
          <LangToggle />
        </div>
      </header>

      <div style={S.wrap}>
        <h1 style={S.title}>{t.misBoletos}</h1>

        {boletos === null ? (
          <p style={S.muted}>{t.cargando}</p>
        ) : boletos.length === 0 ? (
          <div style={S.empty}>
            <p style={{ marginBottom: '1rem' }}>{t.sinBoletos}</p>
            <a href="/" style={S.btn}>{t.buscarViaje}</a>
          </div>
        ) : boletos.map(b => {
          const r = b.viajes?.rutas
          return (
            <div key={b.id} style={S.card}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.ruta}>{r?.origen?.nombre ?? '—'} → {r?.destino?.nombre ?? '—'}</div>
                <div style={S.muted}>
                  {r?.empresas?.nombre}
                  {b.viajes && ` · ${new Date(b.viajes.salida).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ })}`}
                </div>
                <div style={S.fila}><span>{t.asiento}</span><strong style={{ color: 'var(--dorado)' }}>{b.asientos?.numero}</strong></div>
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
  header: { borderBottom: '1px solid var(--borde)', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', gap: '1rem' },
  logo: { fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blanco)', textDecoration: 'none' },
  email: { fontSize: '.75rem', color: 'var(--blanco3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 },
  salir: { background: 'none', border: 'none', color: 'var(--blanco3)', fontSize: '.68rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'underline' },
  wrap: { maxWidth: 720, margin: '2rem auto', padding: '0 1.5rem 4rem' },
  title: { fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, marginBottom: '1.25rem' },
  muted: { fontSize: '.82rem', fontWeight: 300, color: 'var(--blanco3)', marginBottom: '.75rem' },
  empty: { background: 'var(--negro2)', border: '1px solid var(--borde2)', padding: '3rem', textAlign: 'center', color: 'var(--blanco3)' },
  btn: { display: 'inline-block', background: 'var(--dorado)', color: 'var(--negro)', padding: '10px 20px', fontSize: '.68rem', letterSpacing: 2, textTransform: 'uppercase', textDecoration: 'none' },
  card: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', background: 'var(--negro2)', border: '1px solid var(--borde2)', padding: '1.25rem', marginBottom: '1rem' },
  ruta: { fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600 },
  fila: { display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '.82rem', marginBottom: 3, color: 'var(--blanco3)' },
  estado: { display: 'inline-block', marginTop: '.5rem', fontSize: '.62rem', letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 10px', border: '1px solid var(--borde)', color: 'var(--dorado)' },
  estadoOk: { borderColor: 'var(--verde)', color: 'var(--verde)' },
}
