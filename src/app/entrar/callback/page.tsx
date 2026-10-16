'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

// Landing page for the link in Supabase's sign-in email.
// Supabase sends the user here with ?code=..., which we trade for a session.
function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useLang()
  const [error, setError] = useState(false)
  const hecho = useRef(false) // a code can only be exchanged once

  useEffect(() => {
    const next = params.get('next')
    const destino = next && next.startsWith('/') && !next.startsWith('//') ? next : '/mis-viajes'
    const code = params.get('code')
    if (hecho.current) return
    hecho.current = true
    if (!code) return setError(true)

    createClient().auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) return setError(true)
      router.replace(destino)
    })
  }, [params, router])

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
      {error ? (
        <div>
          <p style={{ color: 'var(--dorado)', marginBottom: '.75rem' }}>{t.errorEnlace}</p>
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
