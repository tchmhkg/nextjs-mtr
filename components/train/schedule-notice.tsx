'use client'

import type { MessageKey } from '@i18n/message-key'
import { useTranslations } from 'next-intl'

type ScheduleNoticeProps = Readonly<{
  messageKey: MessageKey
  variant?: 'warning' | 'error'
  onRetry?: () => void
}>

export default function ScheduleNotice({
  messageKey,
  variant = 'warning',
  onRetry,
}: ScheduleNoticeProps) {
  const t = useTranslations()
  const styles =
    variant === 'error'
      ? 'border-red-400/50 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100'
      : 'border-amber-400/60 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
  const body = (
    <>
      {t(messageKey)}
      {onRetry ? (
        <>
          {' '}
          <button type="button" onClick={onRetry} className="underline">
            {t('Retry')}
          </button>
        </>
      ) : null}
    </>
  )
  const className = `mb-3 block rounded-lg border px-3 py-2 text-sm ${styles}`

  if (variant === 'error') {
    return (
      <div role="alert" className={className}>
        {body}
      </div>
    )
  }

  return <output className={className}>{body}</output>
}
