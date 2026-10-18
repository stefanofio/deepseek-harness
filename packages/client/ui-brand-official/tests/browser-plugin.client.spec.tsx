// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject } from '../src/client/index.ts'
import { OfficialBrandMark, OfficialBrandName, OfficialHeroMark } from '../src/client/Brand.tsx'
import { apply as hostApply } from '../src/index.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

const HOLES = [
  'sidebar.brand.mark',
  'sidebar.brand.name',
] as const

const HERO_HOLE = 'conversation.hero.brand.mark'

async function bench(declare = true) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  const declareHoles = () => slots.register({
    name: 'root',
    children: Object.fromEntries([...HOLES, HERO_HOLE].map(name => [name, { kind: 'single', scope: 'root' }])),
  } as never, () => null)
  const disposeHoles = declare ? declareHoles() : undefined
  return { ctx, slots, declareHoles, disposeHoles }
}

describe('official browser-brand plugin', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('declares only the slot service it uses', () => {
    expect(inject).toEqual(['slots'])
  })

  it('registers every occupant regardless of the build profile', async () => {
    // The occupants choose their own artwork from the active-theme hook, so
    // registering unconditionally cannot change what a composition without the
    // theme plugin renders. Skipping the registration outside the official
    // profile made the themed artwork unreachable in exactly the builds a
    // reader uses to evaluate it.
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(subject.slots.entries(hole)).toHaveLength(1)
  })

  it('fills declarations before or after apply and removes every occupant on teardown', async () => {
    const before = await bench()
    const fiber = before.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    before.disposeHoles?.()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)
    before.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)

    const after = await bench(false)
    await after.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(0)
    after.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(1)
  })

  it('claims the conversation hero as well, so a theme can select its own mark there', async () => {
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()
    expect(subject.slots.entries(HERO_HOLE)).toHaveLength(1)
  })

  it('renders the official name independently from both requested mark sizes', () => {
    const name = render(<OfficialBrandName />)
    expect(name.container.querySelector('svg')?.getAttribute('viewBox')).toBe('26 0 156 24')
    name.unmount()

    const mark = render(<OfficialBrandMark size={34} />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('34')
    mark.rerender(<OfficialBrandMark size={24} />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('24')
  })

  it('keeps every official mark and the wordmark when no theme hook is published', () => {
    // A composition without the theme plugin has no server-rendered theme id,
    // so the brand must stay the whale rather than render nothing.
    const mark = render(<OfficialBrandMark size={24} />)
    expect(mark.container.querySelector('svg')).not.toBeNull()
    mark.unmount()

    const hero = render(<OfficialHeroMark size={34} />)
    expect(hero.container.querySelector('svg')).not.toBeNull()
    hero.unmount()

    const name = render(<OfficialBrandName />)
    expect(name.container.querySelector('svg')?.getAttribute('viewBox')).toBe('26 0 156 24')
  })

  it('swaps to the ICE mark and lettered name while cyberpunk is active', () => {
    // The theme publishes one seat carrying the active id, so the brand
    // compares a plain string. Stubbing a selector-shaped hook here would
    // compile and pass while the real seat never satisfied the comparison.
    const seatFor = (id: string) => ({
      activeThemeId: id,
      runningFlavor: undefined,
      runningOperationLine: () => undefined,
      tickRunningFlavor: () => {},
    })

    const mark = render(<OfficialBrandMark size={24} theme={seatFor('cyberpunk')} />)
    expect(mark.container.querySelector('[data-cyber-ice]')).not.toBeNull()
    mark.unmount()

    const hero = render(<OfficialHeroMark size={34} theme={seatFor('cyberpunk')} />)
    expect(hero.container.querySelector('[data-cyber-ice]')).not.toBeNull()
    hero.unmount()

    const name = render(
      <OfficialBrandName theme={{ ...seatFor('cyberpunk'), themedBrandName: 'DEEPSEEK HARNESS' }} />,
    )
    expect(name.container.querySelector('[data-cyber-wordmark]')).not.toBeNull()
    expect(name.container.textContent).toBe('DEEPSEEK HARNESS')
    name.unmount()

    // The whale stays the fallback for every other theme id.
    const dark = render(<OfficialBrandMark size={24} theme={seatFor('dark')} />)
    expect(dark.container.querySelector('[data-cyber-ice]')).toBeNull()
    expect(dark.container.querySelector('svg')).not.toBeNull()
  })
})
