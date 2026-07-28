'use client'

import { useEffect, useState } from 'react'

export function getIsDocumentVisible() {
  if (typeof document === 'undefined') {
    return true
  }
  return document.visibilityState !== 'hidden'
}

/** Visibility for PWAs: visibilitychange alone is flaky on iOS standalone. */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(getIsDocumentVisible)
  useEffect(() => {
    const sync = () => setIsVisible(getIsDocumentVisible())
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('pageshow', sync)
    window.addEventListener('focus', sync)
    sync()
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pageshow', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])
  return isVisible
}
