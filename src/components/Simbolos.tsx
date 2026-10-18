// Honduran drawings used across the site, as inline SVG (no image files to load).
// Colors come from the tokens in globals.css.

/** Scarlet macaw head, facing left. Shared by the full illustration and the small logo mark. */
function Cabeza() {
  return (
    <>
      <circle cx="152" cy="17" r="13" fill="var(--guacamaya)" />
      <path d="M156 26C168 30 176 42 176 56C176 64 172 70 166 72H150C150 60 148 44 146 30Z" fill="var(--guacamaya)" />
      {/* Bare white face patch, then the pale hooked upper beak and black lower beak */}
      <ellipse cx="145" cy="18" rx="7" ry="8.5" fill="#F7F3E8" />
      <circle cx="146" cy="16" r="2.4" fill="var(--tinta)" />
      <path d="M140 9C130 9 125 17 127 27C129 24 132 22 136 22L141 21Z" fill="#EFE6D2" />
      <path d="M136 22C133 24 132 28 134 31C138 30 141 27 142 23Z" fill="var(--tinta)" />
    </>
  )
}

/** Small macaw mark next to the "Sacbé" wordmark and on the ticket confirmation. */
export function MarcaGuacamaya({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="124 2 46 40" width={size} height={size * 40 / 46} aria-hidden focusable="false">
      <Cabeza />
    </svg>
  )
}

/**
 * Home illustration: a scarlet macaw perched on a Copán temple, with the
 * sacbé (white road) running in front of it. The road draws itself once.
 */
export function EstampaCopan({ etiqueta }: { etiqueta: string }) {
  return (
    <svg viewBox="0 0 320 240" width="100%" role="img" aria-label={etiqueta}>
      {/* Stepped temple of green volcanic stone */}
      <g fill="var(--toba)">
        <rect x="40" y="192" width="220" height="24" />
        <rect x="60" y="168" width="180" height="24" />
        <rect x="80" y="144" width="140" height="24" />
        <rect x="100" y="120" width="100" height="24" />
        <rect x="125" y="86" width="50" height="34" />
        <rect x="135" y="72" width="30" height="14" />
      </g>
      {/* Doorway and the central stairway (a nod to Copán's hieroglyphic stairway) */}
      <rect x="142" y="98" width="16" height="22" fill="var(--fondo)" />
      <rect x="138" y="120" width="24" height="96" fill="var(--hundido)" />
      <g stroke="var(--toba)" strokeWidth="1.5">
        {Array.from({ length: 15 }, (_, i) => <line key={i} x1="138" x2="162" y1={126 + i * 6} y2={126 + i * 6} />)}
      </g>

      {/* Macaw standing on the roof comb: wing and long tail hang over the temple */}
      <path d="M160 72H168L180 152L173 154Z" fill="var(--guacamaya)" />
      <path d="M166 72H172L188 142L182 144Z" fill="var(--turquesa)" />
      <Cabeza />
      <path d="M158 38C168 42 175 52 174 62L164 64C163 54 160 46 155 41Z" fill="var(--amarillo)" />
      <path d="M164 62L174 60L176 98L166 80Z" fill="var(--turquesa)" />
      <rect x="149" y="69" width="7" height="5" rx="2" fill="var(--tinta)" />
      <rect x="159" y="69" width="7" height="5" rx="2" fill="var(--tinta)" />

      {/* The white road, with stone edges */}
      <path className="sb-camino" d="M0 232C80 214 220 214 320 228" stroke="var(--toba)" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path className="sb-camino" d="M0 232C80 214 220 214 320 228" stroke="var(--superficie)" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  )
}
