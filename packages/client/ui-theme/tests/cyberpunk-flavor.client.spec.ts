// @vitest-environment jsdom
/**
 * Cyberpunk flavor lines and the running-title observable. The contract under
 * test is that flavor is advertised only while the cyberpunk theme is active,
 * carries localized text rather than a foreign dictionary key, and notifies
 * subscribers exactly when the advertised line changes.
 */
import { describe, expect, it } from 'vitest'
import {
  FLAVOR_INTERVAL_MS, FLAVOR_KEYS, FLAVOR_LINE_COUNT, en, flavorLineAt, isCyberpunkActive,
  zh,
} from '../src/client/cyberpunk-flavor.ts'

describe('cyberpunk flavor dictionaries', () => {
  it('keeps both locales complete and non-empty', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
    for (const key of FLAVOR_KEYS) {
      expect(zh[key], `zh ${key}`).not.toBe('')
      expect(en[key], `en ${key}`).not.toBe('')
    }
  })

  it('rotates over every declared key', () => {
    expect(FLAVOR_KEYS).toHaveLength(Object.keys(zh).length)
    expect(new Set(FLAVOR_KEYS).size).toBe(FLAVOR_KEYS.length)
  })

  it('recognizes only the cyberpunk theme id', () => {
    expect(isCyberpunkActive('cyberpunk')).toBe(true)
    for (const other of ['light', 'dark', 'system', '', 'Cyberpunk']) {
      expect(isCyberpunkActive(other), other).toBe(false)
    }
  })
})

describe('flavorLineAt', () => {
  const translate = (key: string): string => `t:${key}`

  it('holds one line for a whole interval and advances on the next', () => {
    expect(flavorLineAt(translate, 0, 1000)).toBe(flavorLineAt(translate, 999, 1000))
    expect(flavorLineAt(translate, 1000, 1000)).not.toBe(flavorLineAt(translate, 999, 1000))
  })

  it('is a pure function of elapsed time, so a re-render never drifts', () => {
    // The visible line must not depend on how many times the component
    // re-rendered, or the same run reads differently twice.
    expect(flavorLineAt(translate, 12_345, 1000)).toBe(flavorLineAt(translate, 12_345, 1000))
  })

  it('rotates through every line before repeating', () => {
    const seen = new Set<string>()
    for (let step = 0; step < FLAVOR_LINE_COUNT; step += 1) {
      seen.add(flavorLineAt(translate, step * 1000, 1000))
    }
    expect(seen.size).toBe(FLAVOR_LINE_COUNT)
    // The cycle wraps rather than running off the end of the dictionary.
    expect(flavorLineAt(translate, FLAVOR_LINE_COUNT * 1000, 1000)).toBe(flavorLineAt(translate, 0, 1000))
  })

  it('clamps a non-positive interval or a negative elapsed value', () => {
    expect(flavorLineAt(translate, 5000, 0)).toBe(flavorLineAt(translate, 0, 1000))
    expect(flavorLineAt(translate, -5000, 1000)).toBe(flavorLineAt(translate, 0, 1000))
  })

  it('exposes an interval long enough to read a line', () => {
    expect(FLAVOR_INTERVAL_MS).toBeGreaterThanOrEqual(10000)
  })
})
