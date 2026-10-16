/**
 * Returns `next` only if it is a path inside this site, otherwise `fallback`.
 * Prevents "open redirect" attacks, where a link like
 * /entrar?next=https://evil.com would send users to another site after login.
 */
export function rutaInternaSegura(next: string | null, fallback = '/mis-viajes') {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback
}
