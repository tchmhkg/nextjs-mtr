'use client'

import { useTheme } from '@components/theme-provider'
import { Toaster } from 'sonner'

export default function AppToaster() {
  const { mode } = useTheme()
  return (
    <Toaster
      theme={mode === 'dark' ? 'dark' : 'light'}
      position="bottom-center"
      richColors
      closeButton
      offset={24}
      toastOptions={{ duration: 4000 }}
    />
  )
}
