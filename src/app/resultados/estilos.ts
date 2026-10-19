// Shared inline styles for the results page and its booking window.
// Layout that changes with screen size lives in globals.css (sb-* classes).

// Main action button: macaw red. Add className="sb-btn" for the hover color.
const boton: React.CSSProperties = { background: 'var(--guacamaya)', color: '#FFFFFF', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }
// Inner panels: a little darker than the white cards around them
const panel: React.CSSProperties = { background: 'var(--hundido)', borderRadius: 8 }
const etiqueta: React.CSSProperties = { fontSize: '.9rem', fontWeight: 500, color: 'var(--tenue)' }
const totalLinea: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, paddingTop: 10, marginTop: 8, borderTop: '1px solid var(--borde)' }
const linea: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '.95rem', marginBottom: 5, color: 'var(--tenue)' }

export const S: Record<string, React.CSSProperties> = {
  subhead: { background: 'var(--superficie)', borderBottom: '1px solid var(--borde2)', padding: '.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  shRuta: { fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 },
  shFecha: { fontSize: '.95rem', color: 'var(--tinta)', background: 'var(--hundido)', borderRadius: 999, padding: '3px 12px' },
  shEdit: { fontSize: '.95rem', color: 'var(--turquesa)', textDecoration: 'underline', marginLeft: 'auto', cursor: 'pointer' },
  chips: { display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  chip: { padding: '6px 14px', border: '1px solid var(--borde)', borderRadius: 999, background: 'var(--superficie)', fontSize: '.95rem', cursor: 'pointer', color: 'var(--tinta)' },
  chipOn: { border: '1px solid var(--tinta)', background: 'var(--tinta)', color: 'var(--fondo)' },
  tripCard: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12, padding: '1.25rem 1.375rem', cursor: 'pointer', marginBottom: '.875rem' },
  tripSel: { border: '1px solid var(--guacamaya)', boxShadow: 'inset 4px 0 0 var(--guacamaya)' },
  tripEmp: { fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 2 },
  tripClase: { fontSize: '.9rem', color: 'var(--tenue)', display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: '50%', display: 'inline-block' },
  hora: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 },
  ciudadLabel: { fontSize: '.85rem', color: 'var(--tenue)', marginTop: 4 },
  rutaMid: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0 .5rem' },
  duracion: { fontSize: '.85rem', color: 'var(--tenue)' },
  // The trip line is a small white road with stone edges, like the home illustration
  rutaLine: { width: 70, height: 6, background: 'var(--superficie)', border: '2px solid var(--toba)', borderRadius: 4 },
  precioCol: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  precio: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 },
  btnSel: { ...boton, padding: '9px 18px', whiteSpace: 'nowrap' },
  btnSelOn: { background: 'var(--hundido)', color: 'var(--tinta)', border: '1px solid var(--borde)' },
  noResults: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12, padding: '3rem', textAlign: 'center' },
  sideCard: { background: 'var(--superficie)', border: '1px solid var(--borde2)', borderRadius: 12, padding: '1.25rem' },
  sideLabel: { fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '.75rem' },
  sbLine: linea,
  sbTotal: totalLinea,
  btnComprar: { ...boton, width: '100%', padding: 13, marginTop: '1rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, .75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--superficie)', borderRadius: 14, width: '100%', maxWidth: 580, maxHeight: '95vh', overflowY: 'auto', padding: '2rem', position: 'relative' },
  modalX: { position: 'absolute', top: '.875rem', right: '.875rem', width: 32, height: 32, border: '1px solid var(--borde)', background: 'var(--superficie)', cursor: 'pointer', color: 'var(--tinta)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  // Progress: one macaw-feather segment per step
  stepBar: { display: 'flex', gap: 4, marginBottom: '1.5rem', marginRight: '2.5rem' },
  stepDot: { flex: 1, height: 5, borderRadius: 3, background: 'var(--hundido)' },
  stepDotOn: { background: 'var(--guacamaya)' },
  mEyebrow: { fontSize: '.9rem', color: 'var(--tenue)', marginBottom: '.25rem' },
  mTitle: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '.25rem' },
  mSub: { fontSize: '.95rem', color: 'var(--tenue)', marginBottom: '1.25rem' },
  busShell: { ...panel, padding: '1.25rem', marginBottom: '1.25rem' },
  busFront: { width: 76, height: 26, background: 'var(--tinta)', borderRadius: '12px 12px 4px 4px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  busGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, maxWidth: 240, margin: '0 auto' },
  busFrontText: { fontSize: '.8rem', color: 'var(--fondo)', fontWeight: 500 },
  busVacio: { color: 'var(--tenue)', fontSize: '.95rem', gridColumn: '1/-1', textAlign: 'center' },
  seat: { padding: 0, fontFamily: 'inherit', width: 40, height: 40, border: '1px solid var(--borde)', borderRadius: '8px 8px 4px 4px', background: 'var(--superficie)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', color: 'var(--tinta)' },
  seatSel: { border: '1px solid var(--guacamaya)', background: 'var(--guacamaya)', color: '#FFFFFF', fontWeight: 700 },
  seatOcu: { background: 'repeating-linear-gradient(135deg, var(--hundido) 0 4px, var(--borde2) 4px 8px)', color: 'var(--toba)', border: '1px solid var(--borde2)', cursor: 'not-allowed' },
  checkRow: { ...panel, display: 'flex', alignItems: 'center', gap: 10, padding: '.75rem', cursor: 'pointer', marginBottom: '.875rem' },
  ff: { display: 'flex', flexDirection: 'column', gap: 6 },
  ffLabel: etiqueta,
  ffInput: { height: 44, padding: '0 12px', background: 'var(--superficie)', border: '1px solid var(--borde)' },
  metodos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.625rem', marginBottom: '1rem' },
  metodo: { padding: '.875rem', border: '1px solid var(--borde)', borderRadius: 8, background: 'var(--superficie)', cursor: 'pointer', textAlign: 'center', fontSize: '1.3rem' },
  metodoOn: { border: '2px solid var(--tinta)', background: 'var(--hundido)' },
  cardFields: { marginTop: '.875rem' },
  resumenBox: { ...panel, padding: '1rem', margin: '1rem 0' },
  resLine: linea,
  resTotal: totalLinea,
  btnPagar: { ...boton, width: '100%', padding: 13 },
  loginHint: { display: 'block', fontSize: '.95rem', color: 'var(--turquesa)', marginBottom: '.875rem', textDecoration: 'underline' },
  btnBack: { background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--tinta)', padding: '11px 18px', fontWeight: 500, cursor: 'pointer' },

  // Header link + empty state
  back: { fontSize: '.95rem', fontWeight: 500, color: 'var(--tinta)' },
  noResultsTitulo: { fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' },
  noResultsSub: { color: 'var(--tenue)' },

  // Selection summary
  sideVacio: { color: 'var(--tenue)', textAlign: 'center', padding: '1rem 0' },
  sideEmpresa: { fontWeight: 700, marginBottom: 2 },
  sideHoras: { fontSize: '.95rem', color: 'var(--tenue)', marginBottom: 12 },

  // Booking window: cash info + confirmation step
  infoEfectivo: { ...panel, padding: '1rem', color: 'var(--tenue)', marginTop: '.875rem' },
  confIcono: { display: 'flex', justifyContent: 'center', marginBottom: '.75rem' },
  confTitulo: { fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, marginBottom: '.25rem' },
  confSub: { color: 'var(--tenue)', marginBottom: '1.5rem' },
  confDatos: { ...panel, padding: '1rem', textAlign: 'left', marginBottom: '1rem' },
  confFila: { display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '.95rem', marginBottom: 4 },
  btnSecundario: { display: 'block', textAlign: 'center', background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--tinta)' },
}
