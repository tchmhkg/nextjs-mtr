'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  padding: 8px 16px;
  padding-top: calc(8px + env(safe-area-inset-top, 0px));
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: ${({ theme }) => theme.primary};
`

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

  return <Banner role="status">{t('Offline')}</Banner>
}
