'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TERMINALES = [
  { codigo: 'SPS', nombre: 'San Pedro Sula' },
  { codigo: 'TGU', nombre: 'Tegucigalpa' },
  { codigo: 'CEI', nombre: 'La Ceiba' },
  { codigo: 'CMG', nombre: 'Comayagua' },
  { codigo: 'CHO', nombre: 'Choluteca' },
  { codigo: 'CPN', nombre: 'Copán Ruinas' },
  { codigo: 'ROA', nombre: 'Roatán' },
]

const RUTAS_POPULARES = [
  { origen: 'SPS', destino: 'TGU', precio: 265, tiempo: '4h 30m' },
  { origen: 'SPS', destino: 'CEI', precio: 175, tiempo: '3h 30m' },
  { origen: 'SPS', destino: 'CPN', precio: 115, tiempo: '2h 30m' },
  { origen: 'SPS', destino: 'CMG', precio: 150, tiempo: '2h 30m' },
  { origen: 'SPS', destino: 'CHO', precio: 320, tiempo: '5h 30m' },
  { origen: 'SPS', destino: 'ROA', precio: 250, tiempo: '3h' },
]

const NOM: Record<string, string> = Object.fromEntries(
  TERMINALES.map(t => [t.codigo, t.nombre])
)

export default function HomePage() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [origen,  setOrigen]  = useState('SPS')
  const [destino, setDestino] = useState('TGU')
  const [fecha,   setFecha]   = useState(today)
  const [tipo,    setTipo]    = useState<'ida' | 'vuelta'>('ida')

  function swap() {
    setOrigen(destino)
    setDestino(origen)
  }

  function buscar() {
    if (origen === destino) return alert('Origen y destino deben ser distintos')
    router.push(`/resultados?origen=${origen}&destino=${destino}&fecha=${fecha}`)
  }

  function goRuta(o: string, d: string) {
    setOrigen(o); setDestino(d)
    router.push(`/resultados?origen=${o}&destino=${d}&fecha=${today}`)
  }

  return (
    <main>
      {/* ── HEADER ── */}
      <header style={S.header}>
        <a href="/" style={S.logo}>
          <div style={S.logoIcon}><div style={S.logoDiamond} /></div>
          <span>SAC<span style={{ color: 'var(--dorado)' }}>BÉ</span></span>
        </a>
        <nav style={S.nav}>
          <a href="/mis-viajes" style={S.navLink}>Mis viajes</a>
          <a href="/empresas"   style={S.navLink}>Empresas</a>
          <button style={S.btnLogin}>Ingresar</button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroEyebrow}>🇭🇳 Plataforma Nacional de Transporte · Honduras</div>
        <h1 style={S.heroTitle}>
          Conectando destinos,<br />
          <em style={{ color: 'var(--dorado)', fontStyle: 'italic' }}>uniendo personas</em>
        </h1>
        <div style={S.heroLine} />
        <p style={S.heroSub}>
          Inspirados en los caminos blancos de los mayas, Sacbé conecta
          viajeros, empresas y destinos en una sola red inteligente.
        </p>

        {/* ── SEARCH CARD ── */}
        <div style={S.searchCard}>
          {/* Tabs */}
          <div style={S.tabs}>
            {(['ida', 'vuelta'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                style={{ ...S.tab, ...(tipo === t ? S.tabActive : {}) }}
              >
                {t === 'ida' ? 'Solo ida' : 'Ida y vuelta'}
              </button>
            ))}
          </div>

          {/* Search grid */}
          <div style={S.searchGrid}>
            <div style={S.field}>
              <label style={S.label}>Origen</label>
              <select value={origen} onChange={e => setOrigen(e.target.value)} style={S.input}>
                {TERMINALES.map(t => (
                  <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <button onClick={swap} style={S.swapBtn} title="Intercambiar">⇄</button>

            <div style={S.field}>
              <label style={S.label}>Destino</label>
              <select value={destino} onChange={e => setDestino(e.target.value)} style={S.input}>
                {TERMINALES.map(t => (
                  <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div style={S.field}>
              <label style={S.label}>Fecha de viaje</label>
              <input
                type="date"
                value={fecha}
                min={today}
                onChange={e => setFecha(e.target.value)}
                style={S.input}
              />
            </div>

            <button onClick={buscar} style={S.btnSearch}>Buscar →</button>
          </div>
        </div>
      </section>

      {/* ── RUTAS POPULARES ── */}
      <section style={S.rutasSec}>
        <div style={S.secHead}>
          <h2 style={S.secTitle}>Rutas <em style={{ color: 'var(--dorado)', fontStyle: 'italic' }}>desde SPS</em></h2>
        </div>
        <div style={S.rutasGrid}>
          {RUTAS_POPULARES.map(r => (
            <div key={`${r.origen}-${r.destino}`} style={S.rutaCard} onClick={() => goRuta(r.origen, r.destino)}>
              <div style={S.rcDesde}>Desde {NOM[r.origen]}</div>
              <div style={S.rcNombre}>→ {NOM[r.destino]}</div>
              <div style={S.rcInfo}>
                <span style={S.rcPrecio}>Desde <strong style={{ color: 'var(--dorado)' }}>L. {r.precio}</strong></span>
                <span style={S.rcTiempo}>{r.tiempo}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASOS ── */}
      <section style={S.pasosSec}>
        <h2 style={{ ...S.secTitle, textAlign: 'center', marginBottom: '2.5rem' }}>
          El camino es <em style={{ color: 'var(--dorado)', fontStyle: 'italic' }}>simple</em>
        </h2>
        <div style={S.pasosGrid}>
          {[
            { num: 'I',   title: 'Busca tu ruta',    text: 'Elige origen, destino y fecha.' },
            { num: 'II',  title: 'Elige tu asiento', text: 'Mapa visual del bus en tiempo real.' },
            { num: 'III', title: 'Paga seguro',      text: 'Tarjeta o efectivo en PagoExpress.' },
            { num: 'IV',  title: 'Muestra tu QR',    text: 'Boleto digital al instante.' },
          ].map(p => (
            <div key={p.num} style={S.paso}>
              <div style={S.pasoNum}>{p.num}</div>
              <div style={S.pasoTitle}>{p.title}</div>
              <p style={S.pasoText}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={S.footerLogo}>SAC<span style={{ color: 'var(--dorado)' }}>BÉ</span></div>
        <p style={S.footerTagline}>Conectando destinos, uniendo personas.</p>
        <p style={S.footerMeta}>© 2026 Sacbé · Honduras → Centroamérica</p>
      </footer>
    </main>
  )
}

// ── Inline styles (keeps page self-contained for Sprint 1)
const S: Record<string, React.CSSProperties> = {
  header: { background: 'rgba(12,11,9,.9)', borderBottom: '1px solid rgba(201,168,76,.18)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(20px)' },
  logo: { fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blanco)', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 30, height: 30, border: '1.5px solid var(--dorado)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoDiamond: { width: 10, height: 10, background: 'var(--dorado)', transform: 'rotate(45deg)' },
  nav: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  navLink: { color: 'var(--blanco3)', fontSize: '.72rem', letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' },
  btnLogin: { border: '1px solid var(--dorado)', color: 'var(--dorado)', background: 'transparent', padding: '6px 16px', fontSize: '.72rem', letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' },

  hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 1.5rem 4rem', position: 'relative', zIndex: 1 },
  heroEyebrow: { fontSize: '.68rem', letterSpacing: 4, textTransform: 'uppercase', color: 'var(--dorado)', marginBottom: '1.5rem' },
  heroTitle: { fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem,6vw,5.5rem)', fontWeight: 600, lineHeight: 1, marginBottom: '1.5rem' },
  heroLine: { width: 1, height: 50, background: 'linear-gradient(to bottom,transparent,var(--dorado),transparent)', margin: '0 auto 1.5rem' },
  heroSub: { fontSize: '1rem', fontWeight: 300, color: 'var(--blanco3)', maxWidth: 440, lineHeight: 1.8, marginBottom: '2.5rem' },

  searchCard: { background: 'var(--negro3)', border: '1px solid rgba(201,168,76,.18)', padding: '1.75rem', width: '100%', maxWidth: 780 },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(245,240,232,.08)', marginBottom: '1.25rem' },
  tab: { padding: '7px 18px', border: 'none', background: 'transparent', fontSize: '.7rem', letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--blanco3)', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1 },
  tabActive: { color: 'var(--dorado)', borderBottomColor: 'var(--dorado)' },
  searchGrid: { display: 'grid', gridTemplateColumns: '1fr 36px 1fr 1fr auto', gap: '.625rem', alignItems: 'end' },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dorado)' },
  input: { padding: '10px 13px', background: 'var(--negro4)', border: '1px solid rgba(245,240,232,.08)', color: 'var(--blanco)', fontSize: '.875rem', fontWeight: 300, outline: 'none', cursor: 'pointer', appearance: 'none' } as React.CSSProperties,
  swapBtn: { width: 32, height: 32, border: '1px solid rgba(201,168,76,.18)', background: 'transparent', color: 'var(--dorado)', cursor: 'pointer', fontSize: '1rem', alignSelf: 'end' },
  btnSearch: { background: 'var(--dorado)', color: 'var(--negro)', border: 'none', padding: '11px 24px', fontSize: '.7rem', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' } as React.CSSProperties,

  rutasSec: { maxWidth: 1000, margin: '0 auto', padding: '4rem 1.5rem', position: 'relative', zIndex: 1 },
  secHead: { marginBottom: '1.5rem' },
  secTitle: { fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 600 },
  rutasGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(245,240,232,.08)' },
  rutaCard: { background: 'var(--negro)', padding: '1.375rem', cursor: 'pointer', transition: 'background .2s', borderBottom: '2px solid transparent' },
  rcDesde: { fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dorado3)', marginBottom: 4 },
  rcNombre: { fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '.5rem' },
  rcInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rcPrecio: { fontSize: '.82rem', fontWeight: 300, color: 'var(--blanco3)' },
  rcTiempo: { fontSize: '.72rem', color: 'var(--blanco3)', fontWeight: 300 },

  pasosSec: { background: 'var(--negro2)', borderTop: '1px solid rgba(245,240,232,.08)', padding: '4rem 1.5rem', position: 'relative', zIndex: 1 },
  pasosGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' },
  paso: { textAlign: 'center', padding: '0 1rem' },
  pasoNum: { width: 52, height: 52, border: '1px solid var(--dorado)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .875rem', fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--dorado)' },
  pasoTitle: { fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 600, marginBottom: '.4rem' },
  pasoText: { fontSize: '.8rem', fontWeight: 300, color: 'var(--blanco3)', lineHeight: 1.8 },

  footer: { borderTop: '1px solid rgba(245,240,232,.08)', padding: '3rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 },
  footerLogo: { fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', marginBottom: '.5rem' },
  footerTagline: { fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', color: 'var(--blanco3)', marginBottom: '.5rem' },
  footerMeta: { fontSize: '.72rem', letterSpacing: .5, color: 'var(--blanco3)', opacity: .5 },
}
