'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { rutaInternaSegura } from '@/lib/navegacion'
import SiteHeader from '@/components/SiteHeader'

/**
 * /entrar?next=/mis-viajes — passwordless sign-in by email.
 * Step 1: user types their email and Supabase emails them a sign-in link
 *         (it lands on /entrar/callback). A new email creates an account.
 * Step 2: optional code box, for when the email template includes a code.
 */
function EntrarInner() {
  const router = useRouter()
  const next = rutaInternaSegura(useSearchParams().get('next'))
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
      <SiteHeader />

      <div className="sb-card-auth" style={S.card}>
        <div style={S.eyebrow}>{t.entrar}</div>
        <h1 style={S.title}>{t.tituloEntrar}</h1>

        {!enviado ? (
          <form onSubmit={enviar}>
            <p style={S.sub}>{t.subEntrar}</p>
            <label style={S.label}>{t.correo}</label>
            <input style={S.input} type="email" required autoFocus value={email}
              onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
            <button className="sb-btn" style={{ ...S.btn, opacity: cargando ? .7 : 1 }} disabled={cargando}>
              {cargando ? t.enviando : t.enviarCodigo}
            </button>
          </form>
        ) : (
          <form onSubmit={verificar}>
            <p style={S.sub}>{t.codigoEnviado(email.trim())}</p>
            <p style={{ ...S.sub, fontSize: '.9rem' }}>{t.oCodigo}</p>
            <label style={S.label}>{t.codigo6}</label>
            <input style={{ ...S.input, letterSpacing: 8, fontSize: '1.25rem', textAlign: 'center' }}
              inputMode="numeric" autoComplete="one-time-code" maxLength={8} required autoFocus
              value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))} placeholder="123456" />
            <button className="sb-btn" style={{ ...S.btn, opacity: cargando ? .7 : 1 }} disabled={cargando}>
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

// useSearchParams needs a Suspense boundary in Next.js 14
export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarInner />
    </Suspense>
  )
}

const S: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', position: 'relative', zIndex: 1 },
  card: { maxWidth: 420, margin: '4rem auto', padding: '2rem', background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12 },
  eyebrow: { color: 'var(--tenue)', marginBottom: '.25rem' },
  title: { fontSize: '2rem', marginBottom: '.5rem' },
  sub: { color: 'var(--tenue)', marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '.9rem', fontWeight: 500, color: 'var(--tenue)', marginBottom: 6 },
  input: { width: '100%', height: 46, padding: '0 13px', background: 'var(--superficie)', border: '1px solid var(--borde)', marginBottom: '1rem' },
  btn: { width: '100%', background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', padding: 13, fontWeight: 700, cursor: 'pointer' },
  link: { display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', color: 'var(--turquesa)', fontSize: '.95rem', textDecoration: 'underline', cursor: 'pointer' },
  error: { marginTop: '1rem', color: 'var(--rojo)', fontSize: '.95rem', fontWeight: 700, textAlign: 'center' },
}
