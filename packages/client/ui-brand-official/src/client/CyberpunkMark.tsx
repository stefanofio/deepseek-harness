/**
 * The cyberpunk brand art: the ICE mark and lettered name that replace the
 * official DeepSeek whale while the `cyberpunk` theme is active.
 *
 * The mark is an ICE construct after Neuromancer: a hexagonal containment ring
 * around a solid rhombus sigil, with one contact bar under it. It is drawn on
 * its own 24-unit grid rather than reusing the whale viewBox, because the two
 * marks share no geometry — only the slot they occupy. The ring is stroked
 * rather than filled so the sigil survives the sidebar's 20px render, where a
 * solid hexagon collapsed into an indistinct blob.
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
 * The outer shard: a hexagonal ICE ring, stroked rather than filled.
 *
 * A filled hexagon collapsed into an indistinct blob at the sidebar's 20px
 * render and read as a generic badge at any size. The open ring keeps a
 * silhouette at 16px while leaving the middle for the sigil.
 */
const SHARD_RING_PATH = 'M12 2.4 19.6 6.9 19.6 17.1 12 21.6 4.4 17.1 4.4 6.9Z'

/** The core sigil: a solid rhombus seated in the ring. */
const CORE_PATH = 'M12 8 16 12 12 16 8 12Z'

/** The contact bar under the sigil, the mark's one accent in the lighter neon. */
const CONTACT_PATH = 'M9.4 18.1H14.6'

/** Stroke widths, in the mark's own 24-unit grid. */
const RING_STROKE = 2.3
const CONTACT_STROKE = 1.6

/** Hover-swim analogue: the ring's glitch displacement target, interpolated by SMIL. */
const GLITCH_SHIFT_PATH = 'M13.1 2.1 20.4 6.7 20.4 17.3 12.6 21.9 3.9 17.1 3.9 6.7Z'

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
        <path
          d={SHARD_RING_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_STROKE}
          strokeLinejoin="round"
        >
          {active && (
            <animate
              attributeName="d"
              values={`${SHARD_RING_PATH};${GLITCH_SHIFT_PATH};${SHARD_RING_PATH};${GLITCH_SHIFT_PATH};${SHARD_RING_PATH}`}
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
        <path
          d={CONTACT_PATH}
          data-cyber-ice-contact
          stroke="currentColor"
          strokeWidth={CONTACT_STROKE}
          strokeLinecap="round"
        />
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
