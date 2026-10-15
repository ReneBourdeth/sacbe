'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

// "Entrar" when logged out, "Mis boletos" when logged in
export default function AuthLink({ style }: { style?: React.CSSProperties }) {
  const { t } = useLang()
  const [logueado, setLogueado] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setLogueado(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLogueado(!!session))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <a href={logueado ? '/mis-viajes' : `/entrar?next=${encodeURIComponent('/mis-viajes')}`}
      style={{ fontSize: '.68rem', letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--blanco3)', textDecoration: 'none', ...style }}>
      {logueado ? t.misBoletos : t.entrar}
    </a>
  )
}
