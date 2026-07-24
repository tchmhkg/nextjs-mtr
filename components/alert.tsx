'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

interface AlertProps {
  children: React.ReactNode
  onPressClose: () => void
}

export default function Alert({ children, onPressClose }: AlertProps) {
  const t = useTranslations()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onPressClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPressClose])

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      onClick={onPressClose}
    >
      <div
        className="flex w-full max-w-md flex-col rounded-xl bg-surface-alt p-5 text-ink shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="alert-title" className="sr-only">
          {t('Alert')}
        </div>
        {children}
        <button
          type="button"
          onClick={onPressClose}
          aria-label={t('Close alert')}
          className="mt-4 self-center rounded-lg px-4 py-2 text-sm hover:opacity-70"
        >
          {t('close')}
        </button>
      </div>
    </div>
  )
}
