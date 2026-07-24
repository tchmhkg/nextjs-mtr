'use client'

import { useLocalStorage } from '@hooks/useLocalStorage'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  setMode: () => {},
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)

const STATUS_BAR = { light: '#e2e8f0', dark: '#020617' } as const

export default function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mode, setModeStored] = useLocalStorage<ThemeMode>('mode', 'light')

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeStored(next)
    },
    [setModeStored]
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    const themeColor = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null
    if (themeColor) themeColor.setAttribute('content', STATUS_BAR[mode])
    const appleBar = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    ) as HTMLMetaElement | null
    if (appleBar) {
      appleBar.setAttribute(
        'content',
        mode === 'dark' ? 'black-translucent' : 'default'
      )
    }
  }, [mode])

  const toggle = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  const value = useMemo(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
