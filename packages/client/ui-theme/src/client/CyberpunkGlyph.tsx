/**
 * The cyberpunk Appearance-cube glyph: a circuit-trace chip, drawn to the
 * ui-primitives icon conventions (16px viewBox, `currentColor` stroke,
 * `aria-hidden`) so it sits beside the built-in Light/Dark/System artwork
 * without a visual seam.
 *
 * It lives here rather than in ui-primitives because it names one theme: the
 * primitives package is the shared control catalog, and a theme-owned glyph
 * has no second consumer to justify an export there.
 */
import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'

/** Stroke weight matching ui-primitives' medium icons. */
const MEDIUM_STROKE = 1.3

/**
 * Render the chip glyph.
 * @param props - icon size and extra class; color rides `currentColor`.
 * @returns the glyph element.
 */
export function CyberpunkGlyph({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      strokeWidth={MEDIUM_STROKE}
    >
      {/* Package body with a notched corner, and the pin rows leaving each side. */}
      <path d="M5.2 2.5H10.8L13.5 5.2V10.8L10.8 13.5H5.2L2.5 10.8V5.2L5.2 2.5Z" stroke="currentColor" strokeLinejoin="round" />
      <path d="M6 6H10V10H6V6Z" stroke="currentColor" strokeLinejoin="round" />
      <path d="M6.5 0.9V2.5M9.5 0.9V2.5M6.5 13.5V15.1M9.5 13.5V15.1M0.9 6.5H2.5M0.9 9.5H2.5M13.5 6.5H15.1M13.5 9.5H15.1" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}
