'use client'

import { useTheme } from '@components/theme-provider'
import { Toaster } from 'sonner'

export default function AppToaster() {
  const { mode } = useTheme()
  return (
    <Toaster
      theme={mode === 'dark' ? 'dark' : 'light'}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  )
}
