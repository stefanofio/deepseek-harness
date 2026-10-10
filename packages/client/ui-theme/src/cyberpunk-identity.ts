/**
 * Shared identity of the `cyberpunk` built-in theme.
 *
 * These three names are needed by both compiler faces: the Host `boot-theme`
 * row paints the pre-plugin canvas and the palette attribute, while the
 * browser half registers the definition and keys its effect sheet off the same
 * attribute. The values the theme paints live in the browser half
 * (`client/cyberpunk.ts`); only the identity is shared, so the Host face never
 * pulls in a client module.
 */

/** Theme id; also the `setTheme` argument and the durable preference value. */
export const CYBERPUNK_THEME_ID = 'cyberpunk'

/**
 * Body attribute the presenter sets while a registered non-built-in theme is
 * active. The effect sheet keys off it, which is what confines neon, grid, and
 * flicker to this theme and leaves light/dark/system byte-identical.
 */
export const CYBERPUNK_ATTRIBUTE = 'data-dsh-theme'

/**
 * Body attribute carrying the resolved effect-intensity level.
 *
 * The intensity is a theme property rather than a preference the settings
 * schema alone owns: the boot row must apply it before the first paint, and the
 * effect sheet scales its own variables from it in CSS. Publishing it as an
 * attribute keeps both readers off the service.
 */
export const INTENSITY_ATTRIBUTE = 'data-dsh-intensity'
