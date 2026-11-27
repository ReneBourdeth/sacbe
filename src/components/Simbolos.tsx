// The macaw logo, as inline SVG (no image file to load). Drawn with the logo-design skill on a 256 grid:
// a circle head into a neck, a hooked ivory beak, the white face patch with the eye, and the wing's yellow and
// blue as two bands at the neck (the bar's stripe). Masters and icons: docs/logo/; the site icon is src/app/icon.svg.

/** Below 40 px the small cut draws: no lower beak, a bigger eye; the yellow and blue bands stay (they are the brand's colours), so it still reads in a tab or a bar. */
export function MarcaGuacamaya({ size = 22 }: { size?: number }) {
  return size < 40 ? (
    // small: on a round tile that follows the theme (black at night, white by day), so the ivory beak always
    // stands out; by day the beak gets a dark outline (globals.css --marca-*)
    <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden focusable="false">
      <rect x="2" y="2" width="252" height="252" rx="64" fill="var(--marca-placa)" stroke="var(--marca-borde)" strokeWidth="4" />
      <g transform="translate(18 14) scale(.86)">
      <path fill="var(--marca-pico)" stroke="var(--marca-pico)" strokeWidth="14" strokeLinejoin="round" d="M96 62 C54 62 26 98 30 144 C32 162 40 174 50 180 C48 146 64 122 96 116 C108 102 108 76 96 62 Z" />
      <path fill="#D7263D" fillRule="evenodd" d="M152 28 A76 76 0 0 1 228 104 C228 150 214 196 200 236 L120 236 C126 204 116 178 96 158 A76 76 0 0 1 152 28 Z M120 56 A36 40 0 1 0 120.1 56 Z" />
      <path fill="#FFC21A" d="M124 184 L217 184 L210 207 L125 207 Z" />
      <path fill="#4DB8FF" d="M125 213 L208 213 L200 236 L120 236 Z" />
      <path fill="#FFF6EC" d="M120 56 A36 40 0 1 0 120.1 56 Z" />
      <path fill="#161616" d="M132 75 A13 13 0 1 1 131.9 75 Z" />
      <path fill="#EFE3C8" d="M96 62 C54 62 26 98 30 144 C32 162 40 174 50 180 C48 146 64 122 96 116 C108 102 108 76 96 62 Z" />
      </g>
    </svg>
  ) : (
    <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden focusable="false">
      <path fill="#D7263D" fillRule="evenodd" d="M152 28 A76 76 0 0 1 228 104 C228 150 214 196 200 236 L120 236 C126 204 116 178 96 158 A76 76 0 0 1 152 28 Z M120 56 A36 40 0 1 0 120.1 56 Z" />
      <path fill="#FFC21A" d="M125 198 L212 198 L208 213 L123 213 Z" />
      <path fill="#4DB8FF" d="M123 219 L206 219 L200 236 L120 236 Z" />
      <path fill="#FFF6EC" d="M120 56 A36 40 0 1 0 120.1 56 Z" />
      <path fill="#161616" d="M132 78 A10 10 0 1 1 131.9 78 Z" />
      <path fill="#EFE3C8" d="M96 62 C54 62 26 98 30 144 C32 162 40 174 50 180 C48 146 64 122 96 116 C108 102 108 76 96 62 Z" />
      <path fill="#161616" d="M66 186 C76 202 96 206 112 196 C118 190 120 176 116 164 C96 164 76 172 66 186 Z" />
    </svg>
  )
}
