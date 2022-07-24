import { useTheme } from '@theme/theme'
import NextHead from 'next/head'
import { memo } from 'react'

const Head = ({ children }) => {
  const { mode } = useTheme()
  return (
    <NextHead>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content={mode === 'dark' ? 'black-translucent' : 'default'}
      />
      <title>Next MTR Train</title>
      {children}
    </NextHead>
  )
}

export default memo(Head)
