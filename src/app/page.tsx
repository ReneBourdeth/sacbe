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

const NOM: Record<string, string> = Object.fromEntries(
    TERMINALES.map(t => [t.codigo, t.nombre])
)

export default function HomePage() {
    const router = useRouter()
    const today = new Date().toISOString().split('T')[0]
    const [origen, setOrigen] = useState('SPS')
    const [destino, setDestino] = useState('TGU')
    const [fecha, setFecha] = useState(today)

    function swap() { setOrigen(destino); setDestino(origen) }

    function buscar() {
        if (origen === destino) return alert('Origen y destino deben ser distintos')
        router.push(`/resultados?origen=${origen}&destino=${destino}&fecha=${fecha}`)
    }

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'serif', fontSize: '.7rem', letterSpacing: 4, textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>
                🇭🇳 Plataforma Nacional de Transporte
            </div>
            <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 600, lineHeight: 1, textAlign: 'center', marginBottom: '2rem', color: '#F5F0E8' }}>
                Conectando destinos,<br />
                <em style={{ color: '#C9A84C' }}>uniendo personas</em>
            </h1>

            <div style={{ background: '#1C1A16', border: '1px solid rgba(201,168,76,.18)', padding: '1.75rem', width: '100%', maxWidth: 700 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr 1fr auto', gap: '.625rem', alignItems: 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#C9A84C' }}>Origen</label>
                        <select value={origen} onChange={e => setOrigen(e.target.value)} style={{ padding: '10px 13px', background: '#252219', border: '1px solid rgba(245,240,232,.08)', color: '#F5F0E8', fontSize: '.875rem', outline: 'none' }}>
                            {TERMINALES.map(t => <option key={t.codigo} value={t.codigo}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button onClick={swap} style={{ height: 32, border: '1px solid rgba(201,168,76,.18)', background: 'transparent', color: '#C9A84C', cursor: 'pointer', fontSize: '1rem', alignSelf: 'end' }}>⇄</button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#C9A84C' }}>Destino</label>
                        <select value={destino} onChange={e => setDestino(e.target.value)} style={{ padding: '10px 13px', background: '#252219', border: '1px solid rgba(245,240,232,.08)', color: '#F5F0E8', fontSize: '.875rem', outline: 'none' }}>
                            {TERMINALES.map(t => <option key={t.codigo} value={t.codigo}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '.62rem', letterSpacing: 2, textTransform: 'uppercase', color: '#C9A84C' }}>Fecha</label>
                        <input type="date" value={fecha} min={today} onChange={e => setFecha(e.target.value)} style={{ padding: '10px 13px', background: '#252219', border: '1px solid rgba(245,240,232,.08)', color: '#F5F0E8', fontSize: '.875rem', outline: 'none' }} />
                    </div>
                    <button onClick={buscar} style={{ background: '#C9A84C', color: '#0C0B09', border: 'none', padding: '11px 20px', fontSize: '.7rem', letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'end' }}>
                        Buscar →
                    </button>
                </div>
            </div>

            <p style={{ marginTop: '2rem', fontFamily: 'serif', fontStyle: 'italic', color: '#C8BFB0', fontSize: '.9rem' }}>
                Sacbé — Conectando destinos, uniendo personas.
            </p>
        </main>
    )
}