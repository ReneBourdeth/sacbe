// The macaw logo, as inline SVG (no image file to load).
// Colors come from the tokens in globals.css.

/** Scarlet macaw head, facing left. */
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
