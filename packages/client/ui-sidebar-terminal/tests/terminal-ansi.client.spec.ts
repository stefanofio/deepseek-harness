/**
 * ANSI palette discovery for the terminal screen. The contract is that a
 * theme which publishes a complete `--dsh-*-ansi-<key>` variable set gives the
 * terminal that palette, a partial or absent set leaves xterm's defaults
 * alone, and the terminal package imports nothing from any theme package.
 */
import { describe, expect, it } from 'vitest'
import { ansiVariablePrefix, readAnsiPalette } from '../src/client/terminal-theme.ts'

const KEYS = [
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
]

const complete = (prefix: string): string[] => KEYS.map(key => `${prefix}${key}`)

/** Minimal computed-style stand-in over a variable map. */
const style = (variables: Record<string, string>): CSSStyleDeclaration =>
  ({ getPropertyValue: (name: string) => variables[name] ?? '' }) as CSSStyleDeclaration

describe('ansiVariablePrefix', () => {
  it('finds the shared prefix of a complete palette', () => {
    expect(ansiVariablePrefix(complete('--dsh-cyber-ansi-'))).toBe('--dsh-cyber-ansi-')
    expect(ansiVariablePrefix(['--dsw-alias-bg-base', ...complete('--dsh-neon-ansi-')]))
      .toBe('--dsh-neon-ansi-')
  })

  it('rejects a partial palette so the terminal never gets half a theme', () => {
    expect(ansiVariablePrefix(['--dsh-cyber-ansi-red', '--dsh-cyber-ansi-green'])).toBeUndefined()
  })

  it('is undefined for a theme with no ANSI variables', () => {
    expect(ansiVariablePrefix([])).toBeUndefined()
    expect(ansiVariablePrefix(['--dsw-alias-bg-base', '--dsh-cyber-neon'])).toBeUndefined()
    // A non-variable token containing the infix must not be mistaken for one.
    expect(ansiVariablePrefix(['dsh-cyber-ansi-red'])).toBeUndefined()
  })
})

describe('readAnsiPalette', () => {
  it('reads every key under the prefix', () => {
    const variables = Object.fromEntries(KEYS.map((key, i) => [`--dsh-cyber-ansi-${key}`, `#00000${i % 10}`]))
    const palette = readAnsiPalette(style(variables), '--dsh-cyber-ansi-')
    expect(palette).toBeDefined()
    expect(Object.keys(palette!)).toHaveLength(KEYS.length)
    expect(palette!.red).toBe('#000001')
  })

  it('trims whitespace a computed style may pad values with', () => {
    const variables = Object.fromEntries(KEYS.map(key => [`--dsh-cyber-ansi-${key}`, ' #ff0000 ']))
    expect(readAnsiPalette(style(variables), '--dsh-cyber-ansi-')!.red).toBe('#ff0000')
  })

  it('returns undefined without a prefix, so xterm keeps its own palette', () => {
    expect(readAnsiPalette(style({}), undefined)).toBeUndefined()
  })

  it('omits keys the theme left unset rather than emitting blanks', () => {
    const palette = readAnsiPalette(style({ '--p-ansi-red': '#f00' }), '--p-ansi-')
    expect(palette).toEqual({ red: '#f00' })
  })
})
