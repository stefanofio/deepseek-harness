import { BrandWordmark, FishLogo } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the theme plugin's GlobalStandardProps merge for the
// `theme` seat that selects the themed artwork. No value crosses packages here
// — the seat arrives through the slot standard kit, which every slot receives
// regardless of scope.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { HeroCyberMark, IceBrandMark, IceBrandName } from './CyberpunkMark.tsx'

/**
 * The theme id this package draws its own artwork for.
 *
 * Compared against the value the theme plugin publishes; a literal here rather
 * than an import, because a client plugin must not take a value edge on another
 * feature plugin.
 */
const CYBERPUNK_THEME_ID = 'cyberpunk'

/** Global seat as this package consumes it: the published theme seat. */
type BrandStandardProps = PropsRuntime<'sidebar.brand.mark'>

/**
 * Read whether the cyberpunk theme is active.
 *
 * The seat is optional: a composition assembled without the theme plugin
 * (component specs, stripped builds) publishes no seat at all, and the brand
 * keeps the official whale rather than throwing.
 * @param theme - the theme seat from the global standard kit, when present.
 * @returns whether the themed artwork should be drawn.
 */
function isCyberpunk(
  theme: BrandStandardProps['theme'],
): boolean {
  return theme?.activeThemeId === CYBERPUNK_THEME_ID
}

/**
 * Render the sidebar mark for the active theme.
 *
 * This package owns the brand slots, so it — not the theme — decides which mark
 * fills them. A theme asks for its own artwork by being active; it never
 * registers a competing occupant, because the renderer stops consulting the
 * declaring package's fallback as soon as any occupant exists, and an occupant
 * that returned `null` would leave the slot empty rather than falling back.
 * @param props - Host-supplied mark presentation plus the theme seat.
 * @returns the active theme's mark.
 */
export function OfficialBrandMark({
  size, theme,
}: SidebarBrandMarkOwnerProps & Pick<BrandStandardProps, 'theme'>) {
  return isCyberpunk(theme) ? <IceBrandMark size={size} /> : <FishLogo size={size} />
}

/**
 * Render the New Session hero mark for the active theme.
 *
 * The hero is the one slot the official build used to leave on the declaring
 * package's animated-fish fallback. It now registers an occupant so the
 * cyberpunk mark can take it, and that occupant reproduces the official whale
 * itself for every other theme.
 * @param props - Host-supplied mark presentation plus the theme seat.
 * @returns the active theme's hero mark.
 */
export function OfficialHeroMark({
  size, className, theme,
}: HeroBrandMarkOwnerProps & Pick<BrandStandardProps, 'theme'>) {
  return isCyberpunk(theme)
    ? <HeroCyberMark size={size} className={className} />
    : <OfficialHeroFish className={className} />
}

/**
 * The official hero whale, kept inside this package's brand art.
 *
 * The declaring package's own animated hero remains the fallback for
 * compositions that register no occupant here; this is the same silhouette at
 * rest for the ones that do, so the official build is unchanged by this
 * package claiming the hero.
 * @param props.className - host class preserving the surrounding mark geometry.
 * @returns the official hero mark element.
 */
function OfficialHeroFish({ className }: { className?: string | undefined }) {
  return <FishLogo size={34} className={className} />
}

/**
 * Render the name artwork for the active theme.
 *
 * The official wordmark is outlined artwork and cannot be restyled, so the
 * cyberpunk theme letters the product name instead. `themedBrandName` is
 * published by the theme plugin, already localized, because this package cannot
 * read that plugin's locale namespace.
 * @param props.themedBrandName - the theme's localized product name, if any.
 * @param props.theme - the theme seat from the global standard kit.
 * @returns the active theme's name artwork.
 */
export function OfficialBrandName({
  theme,
}: Pick<BrandStandardProps, 'theme'>) {
  const themedBrandName = theme?.themedBrandName
  if (isCyberpunk(theme) && themedBrandName !== undefined) {
    return <IceBrandName name={themedBrandName} />
  }
  return <BrandWordmark includeMark={false} />
}
