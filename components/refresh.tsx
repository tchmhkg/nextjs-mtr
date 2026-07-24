'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

interface RefreshProps {
  onClick: () => void
  isRefreshing?: boolean
}

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
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className={isRefreshing ? 'animate-spin-slow origin-center' : ''}
        fill="currentColor"
      >
        <path
          d="M12.8 5.1541V2.5a.7.7 0 0 1 1.4 0v5a.7.7 0 0 1-.7.7h-5a.7.7 0 0 1 0-1.4h3.573c-.7005-1.8367-2.4886-3.1-4.5308-3.1C4.8665 3.7 2.7 5.85 2.7 8.5s2.1665 4.8 4.8422 4.8c1.3035 0 2.523-.512 3.426-1.4079a.7.7 0 0 1 .986.9938C10.7915 14.0396 9.2186 14.7 7.5422 14.7 4.0957 14.7 1.3 11.9257 1.3 8.5s2.7957-6.2 6.2422-6.2c2.1801 0 4.137 1.1192 5.2578 2.8541z"
          fillRule="nonzero"
        />
      </svg>
    </button>
  )
}

export default React.memo(Refresh)
