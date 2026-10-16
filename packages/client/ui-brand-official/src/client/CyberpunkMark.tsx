/**
 * The cyberpunk brand art: the ICE mark and lettered name that replace the
 * official DeepSeek whale while the `cyberpunk` theme is active.
 *
 * The mark is an ICE construct after Neuromancer and the NetWatch iconography of
 * Cyberpunk 2077: a faceted hexagonal shard with a neural-jack core and four
 * circuit traces entering from the edges. It is drawn on its own 24-unit grid
 * rather than reusing the whale viewBox, because the two marks share no
 * geometry — only the slot they occupy.
 *
 * Decorative brand art, so it is `aria-hidden` like the whale it replaces; the
 * surfaces that render it keep their own accessible names.
 *
 * It lives in this package rather than in ui-theme because the brand slots
 * belong to their registrant: a theme cannot register a competing occupant (the
 * renderer stops consulting the declaring package's fallback once any occupant
 * exists, so an occupant that declined would blank the logo), and a feature
 * plugin must not take a runtime value edge on another feature plugin. Owning
 * both marks here is what lets the theme choose one by being active.
 */
import { useState } from 'react'
import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * Native viewBox of the ICE mark. The art is drawn on a 24-unit grid and the
 * viewBox is exactly that grid: the previous mark bled its circuit traces past
 * the edge, which at a 24px render left the strokes clipped and the silhouette
 * unreadable.
 */
export const ICE_MARK_VIEWBOX = 24

/**
 * The outer shard: a beveled hexagon with a notched crown, the ICE silhouette.
 *
 * Drawn wider than the previous version so the bevels stay legible at the
 * sidebar's 20px render, where sub-unit facets collapse into a blob.
 */
const SHARD_PATH =
  'M12 1.5 21.5 7V12.8L17.6 16.4 21.5 20V22.5H2.5V20L6.4 16.4 2.5 12.8V7Z'

/** The neural-jack core seated in the shard's centre. */
const CORE_PATH = 'M12 8.4 15.8 10.7V15.3L12 17.6 8.2 15.3V10.7Z'

/** The socket bore inside the core. */
const BORE_PATH = 'M12 10.9 13.5 11.8V14.2L12 15.1 10.5 14.2V11.8Z'

/**
 * Circuit traces entering the shard from its four bevels.
 *
 * Inset rather than bleeding past the viewBox: the previous traces terminated
 * outside the grid and were clipped, so the mark read as a bare shard. These
 * stop inside the silhouette and read as contacts on the casing.
 */
const TRACE_PATHS = [
  'M12 5.4V7.2',
  'M17.6 8.6H19.4',
  'M4.6 8.6H6.4',
  'M12 18.4V20.2',
] as const

/** Hover-swim analogue: the shard's glitch displacement targets, interpolated by SMIL. */
const GLITCH_SHIFT_PATH =
  'M12.9 1.5 22.4 7.3V12.5L18.2 16.3 22.2 20.4V22.5H1.8V20.4L5.8 16.3 1.6 12.5V7.3Z'

/**
 * Render the cyberpunk ICE mark.
 *
 * At rest the mark is static. While `active` (the hero's hover hitbox), a SMIL
 * timeline drives three simultaneous effects on one 2.4s period: the shard
 * stutters between its resting and displaced geometry, the core pulses, and a
 * sweep trace travels the crown. Reduced-motion readers never set `active` —
 * the caller samples the preference at pointer entry, exactly as the whale
 * hero does — so the static glyph is what they see on hover.
 * @param props.size - width in px (default 24; the mark is square).
 * @param props.className - extra class for layout placement.
 * @param props.active - whether to run the glitch timeline.
 * @returns the ICE mark svg.
 */
export function IceBrandMark({ size = 24, className, active = false }: IconProps & { active?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox={`0 0 ${ICE_MARK_VIEWBOX} ${ICE_MARK_VIEWBOX}`}
      fill="none"
      aria-hidden="true"
    >
      <g data-cyber-ice>
        <path d={SHARD_PATH} fill="currentColor">
          {active && (
            <animate
              attributeName="d"
              values={`${SHARD_PATH};${GLITCH_SHIFT_PATH};${SHARD_PATH};${GLITCH_SHIFT_PATH};${SHARD_PATH}`}
              keyTimes="0;0.18;0.24;0.3;1"
              calcMode="linear"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path d={CORE_PATH} data-cyber-ice-core fill="currentColor">
          {active && (
            <animate
              attributeName="opacity"
              values="1;0.55;1;0.7;1"
              keyTimes="0;0.2;0.4;0.6;1"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path d={BORE_PATH} data-cyber-ice-bore fill="var(--dsh-cyber-board, #0b0714)" />
        {TRACE_PATHS.map(trace => (
          <path
            key={trace}
            d={trace}
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  )
}

/**
 * The New Session hero's ICE mark, hover-animated.
 *
 * The hero's owner props carry the hitbox class, and the whale it replaces
 * samples the reduced-motion preference at pointer entry. This component keeps
 * that contract: it owns the pointer listener on its own wrapper and runs the
 * glitch timeline only while hovered under a no-preference reader, so the
 * static shard is what everyone else sees.
 * @param props.size - requested square edge in px.
 * @param props.className - host class preserving the surrounding mark geometry.
 * @returns the hero mark element.
 */
export function HeroCyberMark({ size, className }: { size: number; className?: string | undefined }) {
  const [active, setActive] = useState(false)
  return (
    <span
      className={className}
      onMouseEnter={() => {
        if (window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
          setActive(true)
        }
      }}
      onMouseLeave={() => { setActive(false) }}
    >
      <IceBrandMark size={size} active={active} />
    </span>
  )
}

/**
 * Owner props for {@link IceBrandName}: the already-localized brand name.
 *
 * The name arrives as a prop rather than as text in this component because
 * client UI copy is locale-owned; the registering plugin holds the `t` seat and
 * passes the resolved line down.
 */
export interface IceBrandNameProps {
  /** The localized product name to letter as the wordmark. */
  name: string
}

/**
 * Render the cyberpunk brand name beside the mark.
 *
 * The official wordmark is outlined artwork, so a themed replacement cannot
 * restyle it — the letterforms are paths, not type. This letters the product
 * name as live text in the theme's own display treatment instead. Chromatic
 * split, tracking, and the underline rule come from the theme sheet, which
 * scopes them to `body[data-dsh-theme='cyberpunk']`.
 * @param props - see {@link IceBrandNameProps}.
 * @returns the wordmark element.
 */
export function IceBrandName({ name }: IceBrandNameProps) {
  return (
    <span className="dsh-cyber-wordmark" data-cyber-wordmark aria-hidden="true">
      <span data-cyber-wordmark-text>{name}</span>
    </span>
  )
}
