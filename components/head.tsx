'use client'

import { useTheme } from '@theme/theme'
import { useEffect } from 'react'

export default function Head() {
  const { mode, colors } = useTheme()

  useEffect(() => {
    const themeColor = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null
    if (themeColor) themeColor.setAttribute('content', colors.statusBar)

    const appleBar = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    ) as HTMLMetaElement | null
    if (appleBar) {
      appleBar.setAttribute(
        'content',
        mode === 'dark' ? 'black-translucent' : 'default'
      )
    }
  }, [colors.statusBar, mode])

  return null
}
