'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLang, LangToggle } from '@/lib/i18n'

// Only allow redirects back into this site
function destinoSeguro(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/mis-viajes'
}

function EntrarInner() {
  const router = useRouter()
  const next = destinoSeguro(useSearchParams().get('next'))
  const { t } = useLang()

  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        // The default Supabase email contains a link; it lands on /entrar/callback
        emailRedirectTo: `${location.origin}/entrar/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setCargando(false)
    if (error) return setError(t.errorEnvio)
    setEnviado(true)
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')
    const { error } = await createClient().auth.verifyOtp({
      email: email.trim(),
      token: codigo.trim(),
      type: 'email',
    })
    setCargando(false)
    if (error) return setError(t.errorCodigo)
    router.replace(next)
  }

  return (
    <main style={S.main}>
      <header style={S.header}>
        <a href="/" style={S.logo}>SAC<span style={{ color: 'var(--dorado)' }}>BÉ</span></a>
        <LangToggle />
      </header>

      <div style={S.card}>
        <div style={S.eyebrow}>{t.entrar}</div>
        <h1 style={S.title}>{t.tituloEntrar}</h1>

        {!enviado ? (
          <form onSubmit={enviar}>
            <p style={S.sub}>{t.subEntrar}</p>
            <label style={S.label}>{t.correo}</label>
            <input style={S.input} type="email" required autoFocus value={email}
              onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
            <button style={{ ...S.btn, opacity: cargando ? .7 : 1 }} disabled={cargando}>
              {cargando ? t.enviando : t.enviarCodigo}
            </button>
          </form>
        ) : (
          <form onSubmit={verificar}>
            <p style={S.sub}>{t.codigoEnviado(email.trim())}</p>
            <p style={{ ...S.sub, fontSize: '.75rem' }}>{t.oCodigo}</p>
            <label style={S.label}>{t.codigo6}</label>
            <input style={{ ...S.input, letterSpacing: 8, fontSize: '1.25rem', textAlign: 'center' }}
              inputMode="numeric" autoComplete="one-time-code" maxLength={8} required autoFocus
              value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
            <button style={{ ...S.btn, opacity: cargando ? .7 : 1 }} disabled={cargando}>
              {cargando ? t.verificando : t.verificar}
            </button>
            <button type="button" style={S.link} onClick={() => { setEnviado(false); setCodigo(''); setError('') }}>
              {t.cambiarCorreo}
            </button>
          </form>
        )}

        {error && <p style={S.error}>{error}</p>}
      </div>
    </main>
  )
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarInner />
    </Suspense>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', position: 'relative', zIndex: 1 },
  header: { borderBottom: '1px solid var(--borde)', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' },
  logo: { fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blanco)', textDecoration: 'none' },
  card: { maxWidth: 420, margin: '4rem auto', padding: '2rem', background: 'var(--negro2)', border: '1px solid var(--borde2)' },
  eyebrow: { fontSize: '.62rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--dorado)', marginBottom: '.5rem' },
  title: { fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '.5rem' },
  sub: { fontSize: '.85rem', fontWeight: 300, color: 'var(--blanco3)', marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dorado)', marginBottom: 6 },
  input: { width: '100%', padding: '10px 13px', background: 'var(--negro4)', border: '1px solid var(--borde2)', color: 'var(--blanco)', fontSize: '.95rem', outline: 'none', marginBottom: '1rem' },
  btn: { width: '100%', background: 'var(--dorado)', color: 'var(--negro)', border: 'none', padding: 13, fontSize: '.7rem', letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' },
  link: { display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', color: 'var(--blanco3)', fontSize: '.75rem', textDecoration: 'underline', cursor: 'pointer' },
  error: { marginTop: '1rem', color: 'var(--rojo)', fontSize: '.82rem', textAlign: 'center' },
}
