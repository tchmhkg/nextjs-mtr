import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { useLocalStorage } from '@hooks/useLocalStorage'
import darkTheme from '@theme/dark'
import lightTheme from '@theme/light'

const ThemeContext = createContext({
  mode: 'light',
  setMode: (_mode: string) => undefined,
  colors: lightTheme.theme,
})

export const useTheme = () => useContext(ThemeContext)

const ManageThemeProvider = ({ children }) => {
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

const ThemeManager = ({ children }) => {
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const body = <ManageThemeProvider>{children}</ManageThemeProvider>

  // Hack: https://brianlovin.com/writing/adding-dark-mode-with-next-js#client-server-mismatches
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{body}</div>
  }
  return body
}

export default ThemeManager
