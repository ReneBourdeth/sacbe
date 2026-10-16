'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

/** Shows "Entrar" when logged out and "Mis boletos" when logged in. Updates live on sign-in/out. */
export default function AuthLink({ style }: { style?: React.CSSProperties }) {
  const { t } = useLang()
  const [logueado, setLogueado] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setLogueado(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sesion) => setLogueado(!!sesion))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <Link href={logueado ? '/mis-viajes' : '/entrar?next=/mis-viajes'}
      style={{ fontSize: '.68rem', letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--blanco3)', textDecoration: 'none', ...style }}>
      {logueado ? t.misBoletos : t.entrar}
    </Link>
  )
}
