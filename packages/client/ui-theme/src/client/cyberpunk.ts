/**
 * The `cyberpunk` built-in theme: a dark-scheme definition over the base dark
 * palette, keyed to the Cyberpunk 2077 interface — Night City's crimson, hazard
 * yellow, and teal on a near-black chassis, with a hairline grid and amber CRT
 * chrome. The literary register (Neuromancer, Wintermute, the Tessier-Ashpool
 * cores) stays in the copy the theme supplies.
 *
 * The definition carries three groups of variables. Alias tokens (`--dsw-*`)
 * repaint the product surfaces the base palette owns. Effect variables
 * (`--dsh-cyber-*`) have no meaning outside this theme: they parameterize the
 * effect sheet in `../styles/cyberpunk.css`, which activates only while
 * `body[data-dsh-theme='cyberpunk']` is present. Keeping the parameters here
 * means one file states every value the theme uses, so a reader never has to
 * reconcile a palette against a stylesheet.
 *
 * The theme's shared identity — its id and the attribute the presenter sets —
 * lives in `../cyberpunk-identity.ts`, because the Host boot row needs those
 * names without reaching into the browser half.
 */
import { CYBERPUNK_ATTRIBUTE, CYBERPUNK_THEME_ID } from '../cyberpunk-identity.ts'

export { CYBERPUNK_ATTRIBUTE, CYBERPUNK_THEME_ID }

/** Amber CRT phosphor — the running-status readout and terminal chrome. */
const NEON_AMBER = '#ffb347'

/**
 * Cyberpunk 2077's signature interface colors, sampled from the game's own HUD
 * and menu screens. These are the reference values every accent below derives
 * from, so the theme reads as Night City's UI rather than generic neon.
 *
 * The game's red is not a saturated crimson: menu labels are a light coral red
 * over near-black, and the deep crimson appears only as a title-card and hazard
 * mark. The teal is far brighter than a muted aqua, which is what makes the
 * HUD's filled bars read as lit glass.
 */
/** Coral red — the game's interface label red over the dark chrome. */
const CP_RED = '#ff6e73'
/** Muted brick — the menu list's own red, darker than the label red. */
const CP_BRICK = '#80252e'
/** The interface glow blue: the filled bars, badges, and outer bloom. */
const CP_BLUE = '#76fdf7'
/** Maroon used for the backdrop's upper wash before it falls to black. */
const CP_MAROON = '#2e101a'
/** A deeper, more saturated red than the brick, for section headings. */
const CP_SECTION_RED = '#e02b3f'
/** Night City crimson — the title-card and hazard-mark red. */
const CP_CRIMSON = '#c5003c'
/** Hazard yellow — the selection and frame-detailing accent. */
const CP_YELLOW = '#f3e600'
/** Deeper crimson used for the red half of the chromatic fringe. */
const CP_RED_DEEP = '#880425'

/** Neon lime — success and confirmations. */
const NEON_LIME = '#5cf08a'

/** Deepest chassis black; the page sits here. A purple-leaning near-black,
 * matching the game's own backdrop rather than a neutral blue-black. */
const CHASSIS_0 = '#100e24'

/** Raised surface black. */
const CHASSIS_1 = '#16142e'

/** Nested surface black. */
const CHASSIS_2 = '#1c1938'

/** Overlay and popover black. */
const CHASSIS_3 = '#221f42'

/** Hairline borders — teal-tinted so edges read as lit, not painted. */
const EDGE_1 = '#1b2740'
const EDGE_2 = '#28405f'

/** Primary and secondary text; near-white with a cold cast. */
const INK_PRIMARY = '#d7e6f5'
const INK_SECONDARY = '#8aa0bd'

/**
 * Prefix of the ANSI variables this theme publishes for terminal screens.
 * Part of the theme's public surface: the terminal screen discovers the
 * palette by this prefix rather than importing anything from this package.
 */
export const ANSI_VARIABLE_PREFIX = '--dsh-cyber-ansi-'

/**
 * CSS custom property carrying one ANSI entry.
 * @param name - xterm theme key, e.g. `brightCyan`.
 * @returns the custom property the terminal screen reads for that key.
 */
export function ansiVariable(name: string): string {
  return `${ANSI_VARIABLE_PREFIX}${name}`
}

/**
 * ANSI palette for the cyberpunk theme's terminal screens, keyed by xterm's
 * theme names. A terminal is its own color space — its output is program-owned
 * text, not themed product copy — so the palette is declared as data rather
 * than derived from the alias tokens.
 *
 * It reaches the terminal through {@link VALUES} as `--dsh-cyber-ansi-*`
 * custom properties: the terminal screen reads its colors from the host
 * element's computed style, which is the one channel that works without the
 * terminal package taking a value edge on this one.
 */
export const CYBERPUNK_TERMINAL_ANSI: Readonly<Record<string, string>> = Object.freeze({
  black: '#1c1938',
  red: CP_RED,
  green: NEON_LIME,
  yellow: CP_YELLOW,
  blue: '#5b8cff',
  magenta: '#d94f8a',
  cyan: CP_BLUE,
  white: '#c7d5e8',
  brightBlack: '#3d5372',
  brightRed: '#ff9ba4',
  brightGreen: '#8dffb0',
  brightYellow: '#fff45c',
  brightBlue: '#8fb0ff',
  brightMagenta: '#ff8ab5',
  brightCyan: '#a8faff',
  brightWhite: '#eaf4ff',
})

/**
 * Every variable the cyberpunk theme overrides. Both `light` and `dark` carry
 * the same value: the theme is dark-only, and repeating the value keeps the
 * registry's `{ light, dark }` requirement satisfied without a second palette.
 */
const VALUES: Readonly<Record<string, string>> = Object.freeze({
  // --- Alias tokens: surfaces, edges, text -------------------------------
  '--dsw-alias-bg-base': CHASSIS_0,
  '--dsw-alias-bg-layer-1': CHASSIS_1,
  '--dsw-alias-bg-layer-2': CHASSIS_2,
  '--dsw-alias-bg-layer-3': CHASSIS_3,
  '--dsw-alias-bg-overlay': CHASSIS_3,
  '--dsw-alias-border-l1': EDGE_1,
  '--dsw-alias-border-l2': EDGE_2,
  '--dsw-alias-border-l3': EDGE_2,
  '--dsw-alias-border-l4': EDGE_1,
  '--dsw-alias-label-primary': INK_PRIMARY,
  '--dsw-alias-label-secondary': INK_SECONDARY,
  '--dsw-alias-label-tertiary': '#5f7690',
  '--dsw-specific-sidebar-fill': CHASSIS_1,

  // --- Accents ------------------------------------------------------------
  // The brand accent is the title-card crimson: it fills buttons and active
  // marks, where the game uses its saturated red. The lighter coral is the
  // label red, applied on text through `--dsh-cyber-neon` below — the game
  // uses those two reds for those two jobs and they are not interchangeable.
  '--dsw-alias-brand-primary': CP_CRIMSON,
  '--dsw-static-deepseek-400': CP_RED,
  '--dsw-static-deepseek-500': CP_CRIMSON,
  '--dsw-alias-state-success-primary': NEON_LIME,
  '--dsw-alias-state-warn-primary': CP_YELLOW,
  '--dsw-alias-state-error-primary': '#ff4d6d',
  '--dsw-alias-state-idle-primary': INK_SECONDARY,

  // --- Effect parameters (read only by the cyberpunk effect sheet) -------
  '--dsh-cyber-neon': CP_RED,
  '--dsh-cyber-neon-alt': CP_BLUE,
  '--dsh-cyber-brand': CP_CRIMSON,
  '--dsh-cyber-phosphor': NEON_AMBER,
  /** The game's hazard yellow, used for selection and frame detailing. */
  '--dsh-cyber-hazard': CP_YELLOW,
  /** The interface glow blue, used for links, emphasis, and filled marks. */
  '--dsh-cyber-blue': CP_BLUE,
  /** The menu list's own muted red, distinct from the label coral. */
  '--dsh-cyber-brick': CP_BRICK,
  /** The backdrop's upper maroon wash, before it falls to near-black. */
  '--dsh-cyber-maroon': CP_MAROON,
  /** Title red: the deeper red headings are set in. */
  '--dsh-cyber-title': CP_SECTION_RED,
  /** Red half of the chromatic fringe; the deep crimson, never a hot pink. */
  '--dsh-cyber-aberration-red': CP_RED_DEEP,
  '--dsh-cyber-aberration-teal': CP_BLUE,
  /**
   * Effect *scales* — glow radii, the veil's opacity, the aberration offset,
   * the sweep cycle — are deliberately absent here.
   *
   * The presenter applies every token in this map as an inline custom property
   * on `body`, and an inline value outranks any stylesheet rule. A scale
   * published here would therefore pin itself and the intensity ladder in
   * `cyberpunk.css` could never move it. The sheet owns these, which is also
   * where the four levels are declared.
   */

  /** Glow color, in the hazard yellow, for selection and frame detailing. */
  '--dsh-cyber-glow-hazard': `0 0 10px ${CP_YELLOW}99, 0 0 26px ${CP_YELLOW}44`,
  /** Grid pitch and line color for the board backdrop. */
  '--dsh-cyber-grid-size': '38px',
  '--dsh-cyber-grid-line': `${CP_BLUE}2e`,
  /** Brightness swing of the tube flicker and the CRT roll bar. */
  '--dsh-cyber-flicker-min': '0.72',
  '--dsh-cyber-roll-duration': '9s',
  /** Deterministic flicker timing; the effect sheet never hardcodes a duration. */
  '--dsh-cyber-flicker-duration': '4s',
  '--dsh-cyber-pulse-duration': '1.8s',
  '--dsh-cyber-sweep-duration': '2.4s',
  '--dsh-cyber-glitch-duration': '5s',

  // --- ANSI palette for the side terminal (read from computed style) ------
  ...Object.fromEntries(
    Object.entries(CYBERPUNK_TERMINAL_ANSI).map(([name, value]) => [ansiVariable(name), value]),
  ),
})

/** Alias-token subset, for callers that must not see effect variables. */
export const CYBERPUNK_ALIAS_TOKENS: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.entries(VALUES).filter(([name]) => name.startsWith('--dsw-'))),
)

/** Effect-parameter subset (`--dsh-cyber-*`), consumed by the effect sheet. */
export const CYBERPUNK_EFFECT_TOKENS: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(Object.entries(VALUES).filter(([name]) => name.startsWith('--dsh-cyber-'))),
)

/**
 * Per-mode token overrides for the registry. Every entry repeats the single
 * value in both modes: the theme is dark-only, and the registry requires a
 * value per scheme so a mid-flight scheme switch can never blank a token.
 * @returns a fresh override map safe for `ThemeRuntime.register`.
 */
export function cyberpunkTokens(): Record<string, { light: string; dark: string }> {
  return Object.fromEntries(
    Object.entries(VALUES).map(([name, value]) => [name, { light: value, dark: value }]),
  )
}
