'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

// Landing page for the link in Supabase's sign-in email.
// The Supabase browser client exchanges the ?code=... in the URL by itself
// (detectSessionInUrl), so we only wait for the session — exchanging it again
// here would fail because a code can only be used once.
function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLang()
  const [error, setError] = useState('')

  useEffect(() => {
    const next = params.get('next')
    const destino = next && next.startsWith('/') && !next.startsWith('//') ? next : '/mis-viajes'

    // Supabase reports link problems (e.g. otp_expired) in the query or the hash
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const motivo = params.get('error_description') || hash.get('error_description')
    if (motivo) return setError(motivo)

    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace(destino)
    })
    // getSession waits for the automatic URL exchange to finish
    supabase.auth.getSession().then(({ data, error }) => {
      if (data.session) router.replace(destino)
      else setError(error?.message || t.errorEnlace)
    })
    return () => sub.subscription.unsubscribe()
  }, [params, router, t.errorEnlace])

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
      {error ? (
        <div>
          <p style={{ color: 'var(--dorado)', marginBottom: '.5rem' }}>{t.errorEnlace}</p>
          <p style={{ color: 'var(--blanco3)', fontSize: '.75rem', marginBottom: '1rem' }}>{error}</p>
          <a href="/entrar" style={{ color: 'var(--blanco3)', fontSize: '.85rem', textDecoration: 'underline' }}>{t.intentarDeNuevo}</a>
        </div>
      ) : (
        <p style={{ color: 'var(--dorado)', letterSpacing: 2 }}>{t.verificando}</p>
      )}
    </main>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}
