/** Running Turn clock isolated from the transcript's render cycle. */
import { memo, useEffect, useState } from 'react'
import { TextShimmer } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChatViewSlotProps } from '../contract/slots.ts'
import { formatRunDuration, LIVE_RUN_CLOCK_INTERVAL_MS } from './message-chrome.ts'
import { RunningWhaleTail } from './RunningWhaleTail.tsx'
import a11yCss from './accessibility.module.css'
import css from './ChatView.module.css'

interface RunningStatusProps {
  readonly startTime: number | undefined
  readonly t: ChatViewSlotProps['t']
  /**
   * Optional theme-supplied flavor for the running line. The operation form is
   * preferred while a tool is live, so the line names real work; the elapsed
   * form carries the rotation otherwise. Both return `undefined` while no
   * flavor-bearing theme is active, and the whole seam is absent in
   * compositions without the theme plugin.
   */
  readonly runningFlavor?: ChatViewSlotProps['runningFlavor']
  /** The live operation category, or undefined while only reasoning runs. */
  readonly activity?: string | undefined
}

/**
 * Show live elapsed time after the current Turn's content without announcing ticks.
 *
 * A flavor-bearing theme (cyberpunk) replaces the leading label with its own
 * rotation, advanced by the same clock that drives the timer, so the line
 * changes on the timer's cadence without a second subscription. When flavor is
 * showing, the elapsed time keeps its place to the right of the divider: the
 * flavor is decoration, and how long the turn has run is information the reader
 * still needs.
 *
 * The live region always carries the short, non-ticking status text: a screen
 * reader must hear "Running", not a counter that changes every second, and not
 * a joke.
 * @param props - Current Turn start time, localized copy, and optional theme flavor.
 * @returns the blue running indicator; mount only while the Session is running.
 */
export const RunningStatus = memo(function RunningStatus({
  startTime, t, runningFlavor, activity,
}: RunningStatusProps) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (startTime === undefined) return
    setNow(Date.now())
    const timer = setInterval(() => { setNow(Date.now()) }, LIVE_RUN_CLOCK_INTERVAL_MS)
    return () => { clearInterval(timer) }
  }, [startTime])
  const elapsed = startTime === undefined ? undefined : Math.max(1000, now - startTime)
  const duration = elapsed === undefined ? undefined : formatRunDuration(elapsed, t).map(part => part.text).join('')
  // A live operation names itself; only reasoning (or no activity) falls back
  // to the time rotation.
  const operation = activity === undefined ? undefined : runningFlavor?.operation?.(activity, false)
  const flavor = operation ?? (elapsed === undefined ? undefined : runningFlavor?.at?.(elapsed))
  const label = flavor ?? (duration === undefined
    ? t('chat.deepDiving')
    : t('chat.deepDivingFor', { duration }))
  return (
    <div className={css.running} data-chat-running>
      <span className={a11yCss.visuallyHidden} role="status" aria-live="polite" aria-atomic="true">{t('chat.deepDiving')}</span>
      <span className={css.runningDivider} aria-hidden="true" />
      <span className={css.runningContent}>
        <RunningWhaleTail />
        <TextShimmer active className={css.runningText}>{label}</TextShimmer>
        {/* The clock rides its own seat so flavor text cannot push it off the
            line, and so the elapsed time stays visible while a joke displays. */}
        {flavor !== undefined && duration !== undefined && (
          <span className={css.runningElapsed} data-running-elapsed>{duration}</span>
        )}
      </span>
    </div>
  )
})
