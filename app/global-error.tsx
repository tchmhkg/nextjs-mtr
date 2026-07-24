'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useMemo } from 'react'

type GlobalErrorProps = Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>

const COPY = {
  en: {
    title: 'Something went wrong',
    retry: 'Try again',
  },
  tc: {
    title: '發生錯誤',
    retry: '再試一次',
  },
} as const

function resolveLang(): 'en' | 'tc' {
  if (typeof document === 'undefined') return 'en'
  const lang = document.documentElement.lang?.toLowerCase() ?? ''
  if (lang.startsWith('zh') || lang === 'tc') return 'tc'
  return 'en'
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  const copy = useMemo(() => COPY[resolveLang()], [])

  return (
    <html lang={copy === COPY.tc ? 'tc' : 'en'}>
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h2>{copy.title}</h2>
        <button type="button" onClick={() => reset()} style={{ marginTop: 12 }}>
          {copy.retry}
        </button>
      </body>
    </html>
  )
}
