'use client'

import { useEffect, useState } from 'react'
import { crearRuta, crearViaje, editarViaje, getRutasEmpresa, type RutaEmpresa } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { diaHonduras, hora24Honduras, instanteHonduras } from '@/lib/fecha'
import { TERMINALES, nombreTerminal } from '@/lib/terminales'
import type { Clase } from '@/lib/supabase'

const CLASES: Clase[] = ['economica', 'ejecutivo', 'primera']

type Props = {
  empresaId: string
  fecha: string          // day selected in the panel, used as the default for new trips
  onCambio: () => void   // reload the trip list after a change
}

/** "Routes and schedules": the company's routes, plus forms to add a route or a trip. */
export default function Horarios({ empresaId, fecha, onCambio }: Props) {
  const { t } = useLang()
  const [rutas, setRutas] = useState<RutaEmpresa[]>([])
  const [recarga, setRecarga] = useState(0)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    getRutasEmpresa(empresaId).then(setRutas).catch(() => setRutas([]))
  }, [empresaId, recarga])

  // New route form
  const [origen, setOrigen] = useState('SPS')
  const [destino, setDestino] = useState('TGU')
  const [duracion, setDuracion] = useState('')
  const [precioBase, setPrecioBase] = useState('')

  // New trip form
  const [rutaId, setRutaId] = useState('')
  const [dia, setDia] = useState(fecha)
  const [hora, setHora] = useState('08:00')
  const [clase, setClase] = useState<Clase>('economica')
  const [precio, setPrecio] = useState('')
  useEffect(() => setDia(fecha), [fecha])

  async function guardar(accion: () => Promise<void>) {
    setAviso('')
    try {
      await accion()
      setAviso(t.guardado)
      setRecarga(n => n + 1)
      onCambio()
    } catch {
      setAviso(t.errorGuardar)
    }
  }

  const ruta = rutas.find(r => r.id === rutaId)
  const nombreRuta = (r: RutaEmpresa) => `${nombreTerminal(r.origen?.codigo ?? '')} → ${nombreTerminal(r.destino?.codigo ?? '')}`

  return (
    <section style={S.caja}>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '.75rem' }}>{t.rutasHorarios}</h2>

      {rutas.length === 0 ? <p style={S.muted}>{t.sinRutas}</p> : (
        <ul style={S.lista}>
          {rutas.map(r => (
            <li key={r.id}>{nombreRuta(r)} · {Math.floor(r.duracion_min / 60)}h {r.duracion_min % 60 || ''} · L. {r.precio_base}</li>
          ))}
        </ul>
      )}

      <details style={S.detalle}>
        <summary style={S.summary}>{t.nuevaRuta}</summary>
        <form style={S.form} onSubmit={e => { e.preventDefault(); guardar(() => crearRuta(empresaId, origen, destino, Number(duracion), Number(precioBase))) }}>
          <Campo label={t.origen}>
            <select value={origen} onChange={e => setOrigen(e.target.value)} style={S.input}>
              {TERMINALES.map(x => <option key={x.codigo} value={x.codigo}>{x.nombre}</option>)}
            </select>
          </Campo>
          <Campo label={t.destino}>
            <select value={destino} onChange={e => setDestino(e.target.value)} style={S.input}>
              {TERMINALES.map(x => <option key={x.codigo} value={x.codigo}>{x.nombre}</option>)}
            </select>
          </Campo>
          <Campo label={t.duracionMin}><input type="number" min={1} required value={duracion} onChange={e => setDuracion(e.target.value)} style={S.input} /></Campo>
          <Campo label={t.precioBase}><input type="number" min={1} required value={precioBase} onChange={e => setPrecioBase(e.target.value)} style={S.input} /></Campo>
          <button className="sb-btn" style={S.btn} disabled={origen === destino}>{t.guardar}</button>
        </form>
      </details>

      <details style={S.detalle}>
        <summary style={S.summary}>{t.nuevoViaje}</summary>
        <form style={S.form} onSubmit={e => {
          e.preventDefault()
          if (ruta) guardar(() => crearViaje(ruta.id, instanteHonduras(dia, hora), ruta.duracion_min, clase, Number(precio)))
        }}>
          <Campo label={t.ruta}>
            <select required value={rutaId} onChange={e => {
              setRutaId(e.target.value)
              const r = rutas.find(x => x.id === e.target.value)
              if (r && !precio) setPrecio(String(r.precio_base)) // suggest the route's base price
            }} style={S.input}>
              <option value="" disabled>—</option>
              {rutas.map(r => <option key={r.id} value={r.id}>{nombreRuta(r)}</option>)}
            </select>
          </Campo>
          <Campo label={t.fecha}><input type="date" required value={dia} onChange={e => setDia(e.target.value)} style={S.input} /></Campo>
          <Campo label={t.hora}><input type="time" required value={hora} onChange={e => setHora(e.target.value)} style={S.input} /></Campo>
          <Campo label={t.clase}>
            <select value={clase} onChange={e => setClase(e.target.value as Clase)} style={S.input}>
              {CLASES.map(c => <option key={c} value={c}>{t[c]}</option>)}
            </select>
          </Campo>
          <Campo label={t.precio}><input type="number" min={1} required value={precio} onChange={e => setPrecio(e.target.value)} style={S.input} /></Campo>
          <button className="sb-btn" style={S.btn}>{t.guardar}</button>
        </form>
      </details>

      {aviso && <p role="status" style={{ marginTop: '.5rem', fontWeight: 700, color: aviso === t.guardado ? 'var(--verde)' : 'var(--rojo)' }}>{aviso}</p>}
    </section>
  )
}

/** Small "Edit" form on each trip card: change departure time (same day) and price. */
export function EditarViaje({ viaje, onCambio }: {
  viaje: { id: string; salida: string; precio: number; duracion_min: number }
  onCambio: () => void
}) {
  const { t } = useLang()
  const [hora, setHora] = useState(hora24Honduras(viaje.salida))
  const [precio, setPrecio] = useState(String(viaje.precio))
  const [error, setError] = useState(false)

  return (
    <details>
      <summary style={S.summary}>{t.editar}</summary>
      <form style={S.form} onSubmit={async e => {
        e.preventDefault()
        setError(false)
        try {
          await editarViaje(viaje.id, instanteHonduras(diaHonduras(viaje.salida), hora), viaje.duracion_min, Number(precio))
          onCambio()
        } catch {
          setError(true)
        }
      }}>
        <Campo label={t.hora}><input type="time" required value={hora} onChange={e => setHora(e.target.value)} style={S.input} /></Campo>
        <Campo label={t.precio}><input type="number" min={1} required value={precio} onChange={e => setPrecio(e.target.value)} style={S.input} /></Campo>
        <button className="sb-btn" style={S.btn}>{t.guardar}</button>
      </form>
      {error && <p role="alert" style={{ color: 'var(--rojo)', fontWeight: 700 }}>{t.errorGuardar}</p>}
    </details>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={S.campo}><span style={S.label}>{label}</span>{children}</label>
}

const S: Record<string, React.CSSProperties> = {
  caja: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem' },
  muted: { color: 'var(--tenue)' },
  lista: { margin: '0 0 .75rem 1.1rem', color: 'var(--tenue)', display: 'grid', gap: 2 },
  detalle: { marginTop: '.5rem' },
  summary: { cursor: 'pointer', color: 'var(--turquesa)', fontWeight: 500, marginBottom: '.5rem' },
  form: { display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'end', marginBottom: '.5rem' },
  campo: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130, flex: '1 1 130px' },
  label: { fontSize: '.85rem', color: 'var(--tenue)' },
  input: { height: 42, padding: '0 10px', background: 'var(--hundido)', border: '1px solid var(--borde)' },
  btn: { height: 42, background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', padding: '0 18px', fontWeight: 700, cursor: 'pointer' },
}
