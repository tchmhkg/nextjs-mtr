'use client'

import { SerwistProvider } from '@serwist/turbopack/react'
import type { ReactNode } from 'react'

type SerwistProviderWrapperProps = Readonly<{
  children: ReactNode
}>

export default function SerwistProviderWrapper({
  children,
}: SerwistProviderWrapperProps) {
  return <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
}
