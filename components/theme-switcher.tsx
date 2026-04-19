'use client'

import { motion } from 'framer-motion'
import { memo, useCallback } from 'react'

import styles from '@components/theme-switcher.module.scss'
import { useTheme } from '@theme/theme'

const spring = {
  type: 'spring' as const,
  stiffness: 700,
  damping: 30,
}

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme()
  const isOn = mode === 'dark'
  const onChangeTheme = useCallback(() => {
    setMode(isOn ? 'light' : 'dark')
  }, [isOn, setMode])

  return (
    <div
      className={styles.switch}
      data-enabled={isOn}
      data-on="🌜"
      data-off="🌞"
      onClick={onChangeTheme}
    >
      <motion.div className={styles.handle} layout transition={spring} />
    </div>
  )
}

export default memo(ThemeSwitcher)
