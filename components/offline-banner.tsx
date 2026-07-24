'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const t = useTranslations()
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="fixed left-0 right-0 top-0 z-[1200] bg-red-500 px-4 py-2 pt-[calc(8px+env(safe-area-inset-top,0px))] text-center text-sm font-semibold text-white"
    >
      {t('Offline')}
    </div>
  )
}
