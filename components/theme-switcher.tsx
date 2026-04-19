'use client'

import { memo, useCallback } from 'react'

import styles from '@components/theme-switcher.module.scss'
import { useTheme } from '@theme/theme'

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme()
  const isOn = mode === 'dark'
  const onChangeTheme = useCallback(() => {
    setMode(isOn ? 'light' : 'dark')
  }, [isOn, setMode])

  return (
    <div
      className={styles.switch}
      data-enabled={isOn ? 'true' : 'false'}
      data-on="🌜"
      data-off="🌞"
      onClick={onChangeTheme}
    >
      <div className={styles.handle} />
    </div>
  )
}

export default memo(ThemeSwitcher)
