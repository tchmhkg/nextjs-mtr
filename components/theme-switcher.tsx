'use client'

import { memo, useCallback } from 'react'

import styles from '@components/theme-switcher.module.scss'
import { useTheme } from '@theme/theme'
import { useTranslations } from 'next-intl'

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme()
  const t = useTranslations()
  const isOn = mode === 'dark'
  const onChangeTheme = useCallback(() => {
    setMode(isOn ? 'light' : 'dark')
  }, [isOn, setMode])

  return (
    <button
      type="button"
      className={styles.switch}
      data-enabled={isOn ? 'true' : 'false'}
      data-on="🌜"
      data-off="🌞"
      onClick={onChangeTheme}
      aria-label={t('Toggle theme')}
    >
      <span className={styles.handle} aria-hidden="true" />
    </button>
  )
}

export default memo(ThemeSwitcher)
