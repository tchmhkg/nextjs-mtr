'use client'

import { motion } from 'framer-motion'
import { memo, useCallback, useEffect, useState } from 'react'

import styles from '@components/theme-switcher.module.scss'
import { useTheme } from '@theme/theme'

const spring = {
  type: 'spring' as const,
  stiffness: 700,
  damping: 30,
}

const ThemeSwitcher = ({ inNavbar = false }) => {
  const theme = useTheme()
  const [isOn, setIsOn] = useState(theme.mode === 'dark')
  const onChangeTheme = useCallback(
    (e: React.MouseEvent) => {
      setIsOn(!isOn)
    },
    [isOn]
  )

  useEffect(() => {
    queueMicrotask(() => setIsOn(theme.mode === 'dark'))
  }, [theme.mode])

  useEffect(() => {
    theme.setMode(isOn ? 'dark' : 'light')
  }, [isOn, theme])

  return (
    <div
      className={styles.switch}
      data-enabled={isOn}
      data-innavbar={inNavbar}
      data-on="🌜"
      data-off="🌞"
      onClick={onChangeTheme}
    >
      <motion.div className={styles.handle} layout transition={spring} />
    </div>
  )
}

export default memo(ThemeSwitcher)
