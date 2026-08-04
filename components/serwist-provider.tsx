'use client'

import { SerwistProvider } from '@serwist/turbopack/react'
import { useEffect, type ReactNode } from 'react'

type SerwistProviderWrapperProps = Readonly<{
  children: ReactNode
}>

export default function SerwistProviderWrapper({
  children,
}: SerwistProviderWrapperProps) {
  useEffect(() => {
    const register = () => {
      void window.serwist?.register()
    }
    if (document.readyState === 'complete') {
      // Defer past hydrate / first paint
      const id = window.setTimeout(register, 0)
      return () => window.clearTimeout(id)
    }
    window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])

  return (
    <SerwistProvider swUrl="/serwist/sw.js" register={false}>
      {children}
    </SerwistProvider>
  )
}
