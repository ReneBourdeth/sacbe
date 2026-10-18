// Placeholder origin used only to resolve paths; never visited.
const BASE = 'https://sacbe.invalid'

/**
 * Returns `next` only if it is a path inside this site, otherwise `fallback`.
 * Prevents "open redirect" attacks, where a link like
 * /entrar?next=https://evil.com would send users to another site after login.
 * The path is resolved the way browsers do (they read "\" as "/", so "/\evil.com"
 * means evil.com) and is kept only if it stays on our own origin.
 */
export function rutaInternaSegura(next: string | null, fallback = '/mis-viajes') {
  if (!next) return fallback
  try {
    const url = new URL(next, BASE)
    return url.origin === BASE ? url.pathname + url.search + url.hash : fallback
  } catch {
    return fallback
  }
}
