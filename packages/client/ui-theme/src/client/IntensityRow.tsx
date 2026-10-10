/**
 * Effect-intensity row, registered into the General section beside Appearance.
 *
 * The control is present only while the active theme ships an effect layer:
 * light and dark resolve every level to nothing, so offering the dial there
 * would be a control that does nothing. It reads the resolved active theme
 * rather than the preference, so it appears exactly when it can take effect.
 */
import clsx from 'clsx'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { INTENSITY_LEVELS, type IntensityLevel } from '../theme-settings.ts'
import type { ThemeKey } from './locales.ts'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createIntensityRowStore } from './settings-store.ts'
import css from './AppearanceRow.module.css'
import descCss from './FontSizeRow.module.css'

/** Injected business face: the intensity write and whether it applies. */
export interface IntensityRowInjected {
  /** Switch the effect-intensity level. */
  setIntensity: (level: IntensityLevel) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type IntensityRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createIntensityRowStore>>
  & PropsLocale<'settings.theme'>
  & IntensityRowInjected

/** Level order and dictionary keys, weakest first. */
const LEVELS: readonly { id: IntensityLevel; labelKey: ThemeKey }[] = [
  { id: 'low', labelKey: 'intensity.low' },
  { id: 'standard', labelKey: 'intensity.standard' },
  { id: 'high', labelKey: 'intensity.high' },
  { id: 'extreme', labelKey: 'intensity.extreme' },
]

/**
 * Render the effect-intensity row.
 * @param props - composed slot props.
 * @returns the row element tree, or nothing when the active theme has no effects.
 */
export function IntensityRow({ t, setIntensity, useStore }: IntensityRowComponentProps) {
  const intensity = useStore(s => s.intensity)
  // Read from the store, not an injected value: the active theme changes while
  // this row is mounted, and an injected boolean would never update.
  const applies = useStore(s => s.applies)
  // A theme without an effect layer ignores the level entirely, so the row is
  // omitted rather than shown inert.
  if (!applies) return null
  return (
    <div className={css.group}>
      <div className={css.title}>{t('intensity.title')}</div>
      <div className={css.cubeRow}>
        {LEVELS.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.themeCube, intensity === id && css.selected)}
            aria-pressed={intensity === id}
            onClick={() => { setIntensity(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      <div className={descCss.desc}>{t('intensity.description')}</div>
    </div>
  )
}

/** Levels in ascending order, for callers that only need the ladder. */
export { INTENSITY_LEVELS }
