'use client'

import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

type ErrorProps = Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="p-5 text-center text-ink">
      <h2 className="text-lg font-semibold">{t('Something went wrong')}</h2>
      <p className="mt-2 text-muted">{t('Please try again')}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-2 text-sm"
      >
        {t('Retry')}
      </button>
    </div>
  )
}
