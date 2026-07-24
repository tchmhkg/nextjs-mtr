'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

interface AlertProps {
  children: React.ReactNode
  onPressClose: () => void
}

export default function Alert({ children, onPressClose }: AlertProps) {
  const t = useTranslations()
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
    >
      <div className="fixed left-1/2 top-1/2 z-[1000] flex w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-xl bg-surface-alt p-5 text-ink shadow-lg">
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
