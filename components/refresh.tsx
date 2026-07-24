'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

type RefreshProps = Readonly<{
  onClick: () => void
  isRefreshing?: boolean
}>

function Refresh({ onClick, isRefreshing = false }: RefreshProps) {
  const t = useTranslations()
  const onClickButton = useCallback(() => {
    if (isRefreshing) return
    onClick()
  }, [isRefreshing, onClick])

  return (
    <button
      type="button"
      onClick={onClickButton}
      disabled={isRefreshing}
      aria-busy={isRefreshing}
      aria-label={t('Refresh schedule')}
      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ink transition-transform hover:scale-105 disabled:cursor-default disabled:opacity-70"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className={`block ${isRefreshing ? 'animate-spin-slow' : ''}`}
        fill="currentColor"
      >
        <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z" />
      </svg>
    </button>
  )
}

export default React.memo(Refresh)
