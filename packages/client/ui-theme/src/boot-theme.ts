/**
 * Theme bootstrap row for the browser's pre-plugin interval. Each index
 * render embeds the current durable built-in preference, font sizes, and
 * font-family lists. Head CSS colors the document canvas before script
 * execution; the body script installs the palette selector and font variables
 * that the client presenters adopt.
 */

import type { IndexInjection } from '@deepseek-ai/dsh-host-webserver'
import {
  DEFAULT_FONT_SIZES, DEFAULT_INTENSITY, DEFAULT_PREFERENCE, FONT_ROLES, FONT_SIZE_SPECS, fontFamilyVariable, normalizeFontFamily,
  type FontFamilies, type FontSizes, type IntensityLevel, type ThemePreference,
} from './theme-settings.ts'
import { CYBERPUNK_ATTRIBUTE, CYBERPUNK_THEME_ID, INTENSITY_ATTRIBUTE } from './cyberpunk-identity.ts'

const LIGHT_BACKGROUND = '#fff'
const DARK_BACKGROUND = '#151517'
/** Cyberpunk chassis black; matches `--dsw-alias-bg-base` in cyberpunk.ts. */
const CYBERPUNK_BACKGROUND = '#04060b'

/** CSS that colors the document canvas before any script executes. */
function bootThemeStyle(preference: ThemePreference): string {
  const light = `:root{color-scheme:light}body{background-color:${LIGHT_BACKGROUND};--dsh-boot-bg:${LIGHT_BACKGROUND}}`
  const dark = `:root{color-scheme:dark}body{background-color:${DARK_BACKGROUND};--dsh-boot-bg:${DARK_BACKGROUND}}`
  const cyberpunk = `:root{color-scheme:dark}body{background-color:${CYBERPUNK_BACKGROUND};--dsh-boot-bg:${CYBERPUNK_BACKGROUND}}`
  if (preference === 'light') return light
  if (preference === 'dark') return dark
  // Cyberpunk is dark-only, so it never needs a media query; painting its
  // chassis up front keeps the first frame from flashing the default canvas.
  if (preference === CYBERPUNK_THEME_ID) return cyberpunk
  return `${light}@media(prefers-color-scheme:dark){${dark}}`
}

/** Build the body script that installs the palette selector, intensity, and font variables. */
function bootThemeBodyScript(
  preference: ThemePreference,
  fontSizes: FontSizes,
  fontFamilies: FontFamilies,
  intensity: IntensityLevel,
): string {
  const sizes = FONT_ROLES.map(role =>
    `\n  document.body.style.setProperty(${JSON.stringify(FONT_SIZE_SPECS[role].variable)}, ${JSON.stringify(`${fontSizes[role]}px`)})`).join('')
  const families = FONT_ROLES.flatMap((kind) => {
    const list = normalizeFontFamily(fontFamilies[kind])
    return list === '' ? [] : [`\n  document.body.style.setProperty(${JSON.stringify(fontFamilyVariable(kind))}, ${JSON.stringify(list)})`]
  }).join('')
  return `(() => {
  const preference = ${JSON.stringify(preference)}
  const intensity = ${JSON.stringify(intensity)}
  const systemDark = preference === 'system'
    && typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-color-scheme: dark)').matches
  const dark = preference === 'dark' || preference === ${JSON.stringify(CYBERPUNK_THEME_ID)} || systemDark
  document.documentElement.dataset.dsThemeSource = preference
  document.body.toggleAttribute('data-ds-dark-theme', dark)${sizes}${families}
  if (preference === ${JSON.stringify(CYBERPUNK_THEME_ID)}) document.body.setAttribute(${JSON.stringify(CYBERPUNK_ATTRIBUTE)}, preference)
  document.body.setAttribute(${JSON.stringify(INTENSITY_ATTRIBUTE)}, intensity)
})()`
}

/**
 * Theme bootstrap rows: head CSS colors the document canvas before
 * first paint, then the body script installs the palette selector and font
 * size and font families before the shell mount and module script.
 * @param preference - Current Host-backed built-in preference.
 * @param fontSizes - Current Host-backed font sizes in px by role.
 * @param fontFamilies - Current Host-backed font lists; each is normalized before embedding.
 * @param intensity - Current Host-backed effect-intensity level.
 * @returns head and body script rows in execution order.
 */
export function bootThemeInjections(
  preference: ThemePreference = DEFAULT_PREFERENCE,
  fontSizes: FontSizes = DEFAULT_FONT_SIZES,
  fontFamilies: FontFamilies = { text: '', code: '', terminal: '' },
  intensity: IntensityLevel = DEFAULT_INTENSITY,
): IndexInjection[] {
  return [
    { kind: 'style', text: bootThemeStyle(preference) },
    { kind: 'script', placement: 'body', text: bootThemeBodyScript(preference, fontSizes, fontFamilies, intensity) },
  ]
}
