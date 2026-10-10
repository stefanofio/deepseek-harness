/** DSH defaults and application OSC colors for one xterm screen. */
import type { IDisposable, ITheme, Terminal } from '@xterm/xterm'

/* oxlint-disable typescript/no-non-null-assertion -- OSC widths/indices are checked; DSH defaults precede cursor reads. */
const ansiKeys = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'] as const
const specialKeys = ['foreground', 'background', 'cursor'] as const

/** Keep program color overrides separate from the DSH defaults used by OSC resets. */
export class TerminalTheme implements IDisposable {
  private defaults: ITheme = {}
  /** Last inputs handed to {@link update}, for the no-op check across ANSI lists. */
  private last: {
    background: string
    foreground: string
    ansi: Readonly<Record<string, string>> | undefined
  } | undefined
  private readonly indexed = new Map<number, string>()
  private readonly special = new Map<(typeof specialKeys)[number], string>()
  private readonly subscriptions: IDisposable[]

  /**
   * Observe complete OSC commands without consuming xterm's queries or color handling.
   * @param terminal - opened emulator owned by the mounted screen.
   */
  constructor(private readonly terminal: Terminal) {
    const observe = (code: number, change: (data: string) => void): IDisposable =>
      terminal.parser.registerOscHandler(code, (data) => { change(data); return false })
    this.subscriptions = [
      observe(4, (data) => {
        const parts = data.split(';')
        for (let i = 0; i + 1 < parts.length; i += 2) {
          const index = colorIndex(parts[i]!)
          const color = oscColor(parts[i + 1]!)
          if (index !== undefined && color !== undefined) this.indexed.set(index, color)
        }
      }),
      observe(104, (data) => {
        if (data === '') this.indexed.clear()
        else for (const part of data.split(';')) {
          const index = colorIndex(part)
          if (index !== undefined) this.indexed.delete(index)
        }
        this.apply()
      }),
      ...specialKeys.flatMap((key, offset) => [
        observe(10 + offset, (data) => {
          for (const [i, part] of data.split(';').entries()) {
            const target = specialKeys[offset + i]
            const color = oscColor(part)
            if (target !== undefined && color !== undefined) this.special.set(target, color)
          }
        }),
        observe(110 + offset, () => { this.special.delete(key); this.apply() }),
      ]),
    ]
  }

  /**
   * Adopt the host surface's resolved colors, plus the ANSI palette that
   * belongs to the active theme.
   * @param background - resolved opaque DSH background.
   * @param foreground - resolved DSH text color.
   * @param ansi - ANSI palette for the active theme; absent keeps xterm's
   * built-in palette. Program OSC overrides still win over both, because they
   * are applied after these defaults in {@link apply}.
   */
  update(background: string, foreground: string, ansi?: Readonly<Record<string, string>>): void {
    const next = { background, foreground, ansi }
    if (this.last?.background === background && this.last.foreground === foreground
      && sameAnsi(this.last.ansi, ansi)) return
    this.last = next
    this.defaults = {
      background, foreground, cursor: foreground, cursorAccent: background,
      selectionBackground: foreground, selectionForeground: background, selectionInactiveBackground: foreground,
      ...ansi,
    }
    this.apply()
  }

  /** Preferred cursor color after the initial DSH update, including OSC 12 overrides. */
  get cursor(): string { return this.special.get('cursor') ?? this.defaults.cursor! }

  /** Remove parser observers before the emulator is disposed. */
  dispose(): void { for (const subscription of this.subscriptions) subscription.dispose() }

  private apply(): void {
    const theme: ITheme = { ...this.defaults, ...Object.fromEntries(this.special) }
    for (const [index, color] of this.indexed) {
      if (index < ansiKeys.length) theme[ansiKeys[index]!] = color
      else (theme.extendedAnsi ??= [])[index - ansiKeys.length] = color
    }
    this.terminal.options.theme = theme
  }
}

function colorIndex(value: string): number | undefined {
  return /^\d+$/u.test(value) && Number(value) < 256 ? Number(value) : undefined
}

/** Compare two optional ANSI palettes by value; both absent counts as unchanged. */
function sameAnsi(
  left: Readonly<Record<string, string>> | undefined,
  right: Readonly<Record<string, string>> | undefined,
): boolean {
  if (left === right) return true
  if (left === undefined || right === undefined) return false
  const names = Object.keys(left)
  return names.length === Object.keys(right).length && names.every(name => left[name] === right[name])
}

/**
 * ANSI theme keys, in xterm's naming, that a theme may publish as variables.
 * Reading them from computed style is what keeps this package free of a value
 * dependency on any theme package: a theme that declares the variables lights
 * up, and every other theme leaves the terminal on xterm's built-in palette.
 */
const ANSI_THEME_KEYS = [
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
] as const

/**
 * Suffix convention for a theme's ANSI variables: `--dsh-theme-ansi-<key>`.
 * A theme that publishes `<prefix><key>` for these keys gives the terminal a
 * palette; the convention is discovered from the token names the theme already
 * publishes, so no theme package is imported here.
 */
const ANSI_VARIABLE_INFIX = '-ansi-'

/**
 * Find the ANSI variable prefix a theme published, if any.
 * @param tokenNames - the active theme's token names.
 * @returns the shared prefix up to and including the infix, or `undefined`.
 */
export function ansiVariablePrefix(tokenNames: readonly string[]): string | undefined {
  for (const name of tokenNames) {
    const marker = name.indexOf(ANSI_VARIABLE_INFIX)
    if (marker === -1 || !name.startsWith('--')) continue
    const prefix = name.slice(0, marker + ANSI_VARIABLE_INFIX.length)
    // Require the full palette, not one stray variable: a partial set would
    // leave the terminal with a palette half the theme's and half xterm's.
    if (ANSI_THEME_KEYS.every(key => tokenNames.includes(`${prefix}${key}`))) return prefix
  }
  return undefined
}

/**
 * Collect the ANSI palette a theme published on the terminal host element.
 * @param style - computed style of the host element the screen mounts into.
 * @param prefix - variable prefix from {@link ansiVariablePrefix}.
 * @returns the palette, or `undefined` when the theme declares none, so the
 * emulator keeps its own defaults rather than receiving blank entries.
 */
export function readAnsiPalette(
  style: CSSStyleDeclaration,
  prefix: string | undefined,
): Record<string, string> | undefined {
  if (prefix === undefined) return undefined
  const palette: Record<string, string> = {}
  for (const key of ANSI_THEME_KEYS) {
    const value = style.getPropertyValue(`${prefix}${key}`).trim()
    if (value !== '') palette[key] = value
  }
  return Object.keys(palette).length === 0 ? undefined : palette
}

// XParseColor hashes truncate channels; rgb: channels scale. CSS #rgb has different semantics.
function oscColor(value: string): string | undefined {
  const rgb = /^rgb:([\da-f]{1,4})\/([\da-f]{1,4})\/([\da-f]{1,4})$/iu.exec(value)
  let channels: string[]
  if (rgb !== null) {
    channels = rgb.slice(1)
    if (!channels.every(channel => channel.length === channels[0]!.length)) return
  } else {
    if (!/^#(?:[\da-f]{3}){1,4}$/iu.test(value)) return
    const width = (value.length - 1) / 3
    channels = [value.slice(1, width + 1), value.slice(width + 1, 2 * width + 1), value.slice(2 * width + 1)]
  }
  return `#${channels.map((channel) => {
    const n = rgb === null
      ? Number.parseInt(channel.padEnd(2, '0').slice(0, 2), 16)
      : Math.round(Number.parseInt(channel, 16) * 255 / (16 ** channel.length - 1))
    return n.toString(16).padStart(2, '0')
  }).join('')}`
}
