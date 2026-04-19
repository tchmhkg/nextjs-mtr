'use client'

import { createContext, useContext, useEffect } from 'react'
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
  const [mode, setMode] = useLocalStorage('mode', 'light')
  const themeColors = mode === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    document.body.style.background = themeColors.theme.background
  }, [themeColors.theme.background])

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        colors: themeColors.theme,
      }}
    >
      <ThemeProvider theme={themeColors.theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  )
}

const ThemeManager = ({ children }: { children: React.ReactNode }) => {
  return <ManageThemeProvider>{children}</ManageThemeProvider>
}

export default ThemeManager
