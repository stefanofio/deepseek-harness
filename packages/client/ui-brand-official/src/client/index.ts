/** Official DeepSeek Harness occupants for the generic browser-brand slots. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { OfficialBrandMark, OfficialBrandName, OfficialHeroMark } from './Brand.tsx'

/** Required service: the UI slot registry. */
export const inject = ['slots']

/**
 * Fill the browser brand slots as one declaration-aware registration set.
 *
 * This package owns all three: the sidebar mark and name, and the New Session
 * hero mark. Ownership matters because the renderer consults the declaring
 * package's `fallback` only while a slot has no occupant — so a theme cannot
 * contribute a mark that declines outside its own theme, as that would leave
 * the slot empty instead of falling back. Each occupant therefore chooses the
 * official or themed artwork itself from the active-theme hook, and the whale
 * is what every composition without the theme plugin renders.
 *
 * The hero occupant reproduces the official whale rather than deferring to
 * ui-conversation's animated fallback, so claiming that slot cannot change the
 * official build's appearance.
 *
 * Every occupant renders the whale unless the theme plugin is loaded and its
 * theme is active, so registering unconditionally cannot change the appearance
 * of a composition without that plugin. The former profile guard made the
 * themed artwork unreachable in exactly the builds a reader uses to evaluate
 * it, because `DSH_CLIENT_BUILD_PROFILE` is unset outside an official release
 * build and the whole registration was skipped.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', () =>
      ctx.slots.inject('conversation.hero.brand.mark', function* () {
        yield ctx.slots.register({ name: 'sidebar.brand.mark' }, OfficialBrandMark)
        yield ctx.slots.register({ name: 'conversation.hero.brand.mark' }, OfficialHeroMark)
        yield ctx.slots.register({ name: 'sidebar.brand.name' }, OfficialBrandName)
      })))
}
