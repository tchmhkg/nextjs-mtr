'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { useLocalStorage } from '@hooks/useLocalStorage'
import darkTheme from '@theme/dark'
import lightTheme from '@theme/light'

interface ThemeContextType {
  mode: string
  setMode: (mode: string) => void
  colors: typeof lightTheme.theme
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  setMode: (_mode: string) => {},
  colors: lightTheme.theme,
})

export const useTheme = () => useContext(ThemeContext)

const ManageThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [modeFromStorage, setModeToStorage] = useLocalStorage('mode', 'light')
  const [themeState, setThemeState] = useState(modeFromStorage)

  const themeColors = themeState === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    document.body.style.background = themeColors.theme.background

    if (themeState !== modeFromStorage) {
      setModeToStorage(themeState)
    }
  }, [
    themeState,
    modeFromStorage,
    setModeToStorage,
    themeColors.theme.background,
  ])

  return (
    <ThemeContext.Provider
      value={{
        mode: themeState,
        setMode: setThemeState,
        colors: themeColors.theme,
      }}
    >
      <ThemeProvider theme={themeColors.theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  )
}

const ThemeManager = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const body = <ManageThemeProvider>{children}</ManageThemeProvider>

  // Hack: https://brianlovin.com/writing/adding-dark-mode-with-next-js#client-server-mismatches
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{body}</div>
  }
  return body
}

export default ThemeManager
