import { useEffect, useState } from 'react'

export function getIsDocumentVisible() {
  if (typeof document === 'undefined') {
    return true
  }
  return !document.hidden
}

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(getIsDocumentVisible)
  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(getIsDocumentVisible())
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
  return isVisible
}
