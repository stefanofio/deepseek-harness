// @vitest-environment jsdom
/** Dynamic ui-theme entry owns the global styles in dependency order. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it } from 'vitest'
import { installThemeStyles } from '../src/client/styles.ts'

const PLUGIN_ID = '@deepseek-ai/dsh-client-ui-theme'

/**
 * The effect sheet on disk. Read directly rather than through the `?inline`
 * import, which resolves to an empty string under vitest, and resolved from the
 * working directory because the jsdom environment rewrites `import.meta.url`.
 * `stylesheet-scan.ts` is not reused here: it resolves package paths from
 * `import.meta.url` at module load and throws under this environment.
 */
const EFFECT_SHEET = join(process.cwd(), 'packages/client/ui-theme/src/styles/cyberpunk.css')

/** The theme definition module; a scale published here would be pinned inline. */
const TOKEN_MODULE = join(process.cwd(), 'packages/client/ui-theme/src/client/cyberpunk.ts')

/** One flattened rule: comma-separated selectors plus its declarations. */
interface Rule {
  selectors: string[]
  declarations: [property: string, value: string][]
}

/** Flatten a sheet into rules; comments removed, nesting not handled. */
function parseRules(css: string): Rule[] {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, ' ')
  return [...body.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector = '', declarations = '']) => ({
    selectors: selector.split(',').map(part => part.trim()),
    declarations: declarations.split(';')
      .map(part => part.trim())
      .filter(part => part.includes(':'))
      .map((part): [string, string] => {
        const colon = part.indexOf(':')
        return [part.slice(0, colon).trim(), part.slice(colon + 1).trim()]
      }),
  }))
}

afterEach(() => {
  document.head.querySelectorAll(`style[data-plugin="${PLUGIN_ID}"]`).forEach((node) => { node.remove() })
})

describe('ui-theme client styles', () => {
  it('mounts every global sheet in dependency order and removes them on dispose', async () => {
    const ctx = new Context()
    const fiber = ctx.plugin({
      apply(scope) { installThemeStyles(scope) },
    })
    await fiber.await()

    const styles = [...document.head.querySelectorAll<HTMLStyleElement>(`style[data-plugin="${PLUGIN_ID}"]`)]
    expect(styles.map(style => style.dataset.pluginCss)).toEqual([
      `${PLUGIN_ID}/base.css`,
      `${PLUGIN_ID}/corner-shape.css`,
      `${PLUGIN_ID}/cyberpunk.css`,
      `${PLUGIN_ID}/design-platform.css`,
      `${PLUGIN_ID}/focus.css`,
      `${PLUGIN_ID}/onboarding.css`,
      `${PLUGIN_ID}/scrollbar.css`,
      `${PLUGIN_ID}/gradient-shadow-text.css`,
      `${PLUGIN_ID}/shiki.css`,
    ])
    await fiber.dispose()
    expect(document.head.querySelectorAll(`style[data-plugin="${PLUGIN_ID}"]`)).toHaveLength(0)
  })

  it('scopes every cyberpunk effect rule to the theme attribute', () => {
    // The intensity of the effect layer is a design choice; this contract is
    // not. An unscoped rule would repaint the light and dark palettes, which is
    // the one thing the sheet must never do.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
      // Keyframe steps are not selectors; drop the blocks so the scan sees only
      // real rules.
      .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, ' ')
    const rules = parseRules(css)
    expect(rules.length).toBeGreaterThan(0)
    for (const rule of rules) {
      // The default-hidden rule is deliberately unscoped: it is what keeps the
      // chrome out of the other themes, so it must reach them.
      if (rule.declarations.every(([property, value]) => property === 'display' && value === 'none')) continue
      for (const selector of rule.selectors) {
        expect(selector, `unscoped rule: ${selector}`).toContain("body[data-dsh-theme='cyberpunk']")
      }
    }
  })

  it('drops every animation under reduced motion while keeping the statics', () => {
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const overrideStart = css.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(overrideStart).toBeGreaterThan(-1)
    const override = css.slice(overrideStart)
    const animated = parseRules(css.slice(0, overrideStart))
      .filter(rule => rule.declarations.some(([property]) => property === 'animation'))
      .flatMap(rule => rule.selectors)
    expect(animated.length).toBeGreaterThan(0)
    const disabled = new Set(parseRules(override)
      .filter(rule => rule.declarations.some(([property, value]) => property === 'animation' && value === 'none'))
      .flatMap(rule => rule.selectors))
    // Every selector that animates outside the override must be switched off
    // inside it, or a reader who asked for reduced motion still gets the motion.
    for (const selector of animated) {
      expect(disabled, `not disabled under reduced motion: ${selector}`).toContain(selector)
    }
  })

  it('keeps monospace text free of chromatic aberration', () => {
    // Code blocks are the densest text on screen; a color fringe there costs
    // character recognition, so the body-text treatment must exclude them.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const crisped = parseRules(css)
      .filter(rule => rule.declarations.some(
        ([property, value]) => property === 'text-shadow' && value === 'none'))
      .flatMap(rule => rule.selectors)
    for (const tag of ['pre', 'code']) {
      expect(crisped.some(selector => selector.endsWith(tag)), tag).toBe(true)
    }
  })

  it('scopes the CRT roll bar to the main viewport, and the veil to the window', () => {
    // The roll bar is the deck's own display refreshing: it must not appear to
    // run across a sidebar or a terminal pane, which are separate instruments.
    // The scanline veil is the CRT surface, so it does cover the whole window.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const rules = parseRules(css.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, ' '))
    const rollBar = rules.filter(rule => rule.declarations.some(([property]) => property === 'animation')
      && rule.declarations.some(([, value]) => value.includes('dsh-cyber-roll')))
    expect(rollBar.length).toBeGreaterThan(0)
    // The band itself targets the viewport's dedicated element. The extreme
    // level adds a vertical-hold slip on the window veil, which reuses the same
    // keyframes, so the assertion is about where the band is *drawn* rather
    // than about how many rules name the animation.
    const band = rollBar.filter(rule => rule.selectors.some(selector => selector.includes('[data-cyber-rollbar]')))
    expect(band).toHaveLength(1)
    for (const rule of rollBar) {
      for (const selector of rule.selectors) {
        expect(selector, `roll band on a side panel: ${selector}`)
          .not.toMatch(/data-(rightbar-col|sidebar-terminal)/u)
      }
    }
    // The window-wide veil carries the scanline gradient but does not roll.
    const veil = rules.find(rule => rule.selectors.includes("body[data-dsh-theme='cyberpunk']::after"))
    expect(veil).toBeDefined()
    expect(veil!.declarations.some(([, value]) => value.includes('repeating-linear-gradient'))).toBe(true)
    expect(veil!.declarations.some(([property]) => property === 'animation')).toBe(false)
  })

  it('hides the viewport chrome by default and reveals it only for cyberpunk', () => {
    // The frame renders this chrome unconditionally, so the sheet is what keeps
    // it out of light and dark; without a default-hidden rule the readout's
    // text would appear unstyled in every other theme.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const attr = '[data-cyber-viewport]'
    for (const selector of ['[data-cyber-rollbar]', '[data-cyber-rule]', '[data-cyber-linkframe]', `${attr}::before`, `${attr}::after`]) {
      const base = parseRules(css).find(rule => rule.selectors.includes(selector)
        && rule.declarations.some(([property, value]) => property === 'display' && value === 'none'))
      expect(base, `no default-hidden rule for ${selector}`).toBeDefined()
      // The selector must be unscoped, or a themed page never reaches it.
      for (const part of base!.selectors) {
        expect(part).not.toContain("data-dsh-theme='cyberpunk'")
      }
    }
  })

  it('keeps the grid on the side panels and the wash on the viewport', () => {
    // The grid competes with transcript text over a long conversation, so it
    // belongs on the instrument panels. The viewport keeps the wash alone.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const rules = parseRules(css.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, ' '))
    const gridRules = rules.filter(rule => rule.declarations.some(
      ([property, value]) => property === 'background-image' && value.includes('90deg')))
    expect(gridRules.length).toBeGreaterThan(0)
    for (const rule of gridRules) {
      for (const selector of rule.selectors) {
        expect(selector, `grid outside a side panel: ${selector}`).not.toContain('[data-cyber-viewport]')
      }
    }
  })

  it('retunes the composer fill at the specificity the base sheet sets it', () => {
    // design-platform.css declares this token on the dark-palette body attribute
    // and loads after this sheet, so a weaker selector here would lose and the
    // composer would keep its neutral grey over the wash.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const declarations = parseRules(css).filter(rule => rule.declarations.some(
      ([property]) => property === '--dsw-specific-input-major'))
    expect(declarations.length).toBeGreaterThan(0)
    for (const rule of declarations) {
      for (const selector of rule.selectors) {
        expect(selector, `too weak: ${selector}`).toContain('data-ds-dark-theme')
      }
    }
  })

  it('declares every intensity scale in all four levels, and keeps them out of the token map', () => {
    // Two failure modes this pins, both seen in practice. A level that omits a
    // scale silently inherits whatever the level before it set, so the ladder
    // looks broken only at some steps. And a scale published as a *token*
    // freezes: the presenter applies every token as an inline custom property
    // on body, and an inline value outranks the stylesheet rule that would
    // otherwise vary it by level.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    const tokens = readFileSync(TOKEN_MODULE, 'utf8')
    const scales = [...new Set([...css.matchAll(/var\((--dsh-cyber-[a-z-]+)/g)]
      .flatMap(match => match[1] === undefined ? [] : [match[1]]))]
      .filter(name => !name.includes('ansi'))
    expect(scales.length).toBeGreaterThan(0)
    const levels = ['low', 'standard', 'high', 'extreme']
    const blocks = new Map(levels.map((level) => {
      const start = css.indexOf(`data-dsh-intensity='${level}'] {`)
      expect(start, `no block for ${level}`).toBeGreaterThan(-1)
      return [level, css.slice(start, css.indexOf('}', start))]
    }))
    // Every scale that any level declares is a scale the ladder varies, so it
    // must appear in all of them: a level that omits one silently inherits
    // whichever level the cascade resolved first, which is the bug where the
    // dial "works" but only some steps change anything.
    const varying = scales.filter(name => levels.some(level => blocks.get(level)!.includes(`${name}:`)))
    expect(varying.length).toBeGreaterThan(0)
    for (const level of levels) {
      for (const scale of varying) {
        expect(blocks.get(level), `${level} omits ${scale}`).toContain(`${scale}:`)
      }
    }
    // The scales that vary must not also be published as theme tokens.
    for (const scale of varying) {
      expect(tokens, `${scale} is a token and would pin inline`).not.toContain(`'${scale}':`)
    }
  })

  it('keeps the menu material owned by the platform sheet', () => {
    // A package gate reserves the menu fill and blur tokens for
    // design-platform.css; this sheet may restyle the material it renders but
    // must not claim the tokens, or one theme would own menus on every platform.
    const css = readFileSync(EFFECT_SHEET, 'utf8')
    for (const token of ['--dsw-specific-menu', '--dsw-menu-surface-fill', '--dsw-menu-backdrop-filter']) {
      expect(css, token).not.toContain(`${token}:`)
    }
  })
})
