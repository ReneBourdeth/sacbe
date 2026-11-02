'use client'

import { useEffect, useRef, useState } from 'react'
import { validarBoleto, type BoletoValidado } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { formatoHora } from '@/lib/fecha'
import { nombreTerminal } from '@/lib/terminales'

// The browser's built-in QR reader (Chrome on Android and computers). Not in TypeScript's types yet.
type Detector = { detect(fuente: HTMLVideoElement): Promise<{ rawValue: string }[]> }
declare global {
  interface Window { BarcodeDetector?: new (opciones: { formats: string[] }) => Detector }
}

type Resultado = { ok: true; datos: BoletoValidado } | { ok: false; mensaje: string }

/**
 * Boarding check for staff: scan a ticket's QR with the camera, or type its code.
 * A valid ticket is marked "usado" so it can't be used twice.
 */
export default function Escaner({ onValidado }: { onValidado: () => void }) {
  const { t, locale } = useLang()
  const video = useRef<HTMLVideoElement>(null)
  const ocupado = useRef(false) // one check at a time, even if the camera sees the code twice
  const [camara, setCamara] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  // shortcut: iPhone Safari has no BarcodeDetector, so staff type the code there; add a JS QR library if stations use iPhones
  const hayLector = typeof window !== 'undefined' && !!window.BarcodeDetector

  async function validar(texto: string) {
    if (ocupado.current || !texto.trim()) return
    ocupado.current = true
    try {
      setResultado({ ok: true, datos: await validarBoleto(texto) })
      setCodigo('')
      onValidado()
    } catch (e) {
      const clave = (e instanceof Error ? e.message : '') as keyof typeof t.errValidar
      setResultado({ ok: false, mensaje: t.errValidar[clave] ?? t.errorViajes })
    } finally {
      ocupado.current = false
    }
  }

  // While the camera is on, look for a QR code a few times per second
  useEffect(() => {
    if (!camara || !window.BarcodeDetector) return
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    let activo = true
    let flujo: MediaStream | null = null
    let reloj = 0

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        flujo = s
        if (!activo || !video.current) return s.getTracks().forEach(p => p.stop())
        video.current.srcObject = s
        video.current.play()
        reloj = window.setInterval(async () => {
          if (!video.current || video.current.readyState < 2) return
          const [qr] = await detector.detect(video.current).catch(() => [])
          if (qr && activo) { setCamara(false); validar(qr.rawValue) } // one scan per press
        }, 300)
      })
      .catch(() => { setCamara(false); setResultado({ ok: false, mensaje: t.camaraNoDisponible }) })

    return () => { activo = false; clearInterval(reloj); flujo?.getTracks().forEach(p => p.stop()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the camera is switched on/off
  }, [camara])

  return (
    <section style={S.caja}>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '.75rem' }}>{t.validarBoletos}</h2>

      {hayLector && (
        <button className="sb-btn" style={S.btn} onClick={() => { setResultado(null); setCamara(c => !c) }}>
          {camara ? t.cerrarCamara : t.escanearQR}
        </button>
      )}
      {camara && <video ref={video} muted playsInline style={S.video} />}

      <form onSubmit={e => { e.preventDefault(); validar(codigo) }} style={S.fila}>
        <input aria-label={t.codigo} placeholder="SCB-…" value={codigo} onChange={e => setCodigo(e.target.value)} style={S.input} />
        <button className="sb-btn" style={S.btn}>{t.validar}</button>
      </form>

      {resultado && (
        <div role="status" style={{ ...S.resultado, borderColor: resultado.ok ? 'var(--verde)' : 'var(--rojo)' }}>
          {resultado.ok ? (
            <>
              <strong style={{ color: 'var(--verde)', fontSize: '1.2rem' }}>✓ {t.boletoValido}</strong>
              <div>{resultado.datos.nombre} · {t.asiento} <strong>{resultado.datos.asiento}</strong></div>
              <div style={{ color: 'var(--tenue)' }}>
                {nombreTerminal(resultado.datos.origen)} → {nombreTerminal(resultado.datos.destino)} · {formatoHora(resultado.datos.salida, locale)}
              </div>
            </>
          ) : (
            <strong style={{ color: 'var(--rojo)', fontSize: '1.1rem' }}>✕ {resultado.mensaje}</strong>
          )}
        </div>
      )}
    </section>
  )
}

const S: Record<string, React.CSSProperties> = {
  caja: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem' },
  btn: { background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  video: { display: 'block', width: '100%', maxWidth: 360, aspectRatio: '1', objectFit: 'cover', borderRadius: 8, margin: '.75rem 0', background: '#000' },
  fila: { display: 'flex', gap: '.5rem', marginTop: '.75rem' },
  input: { flex: 1, minWidth: 0, height: 44, padding: '0 12px', background: 'var(--hundido)', border: '1px solid var(--borde)', fontFamily: 'monospace' },
  resultado: { marginTop: '1rem', padding: '.75rem 1rem', border: '2px solid', borderRadius: 8, display: 'grid', gap: 4 },
}
