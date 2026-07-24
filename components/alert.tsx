'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useRef } from 'react'

type AlertProps = Readonly<{
  children: React.ReactNode
  onPressClose: () => void
}>

export default function Alert({ children, onPressClose }: AlertProps) {
  const t = useTranslations()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (!el.open) el.showModal()
    const onCancel = (e: Event) => {
      e.preventDefault()
      onPressClose()
    }
    el.addEventListener('cancel', onCancel)
    return () => el.removeEventListener('cancel', onCancel)
  }, [onPressClose])

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[1200] m-0 flex h-dvh max-h-none w-screen max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-transparent open:flex"
      aria-labelledby="alert-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={t('Close alert')}
        onClick={onPressClose}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-xl bg-surface-alt p-5 text-ink shadow-lg">
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
    </dialog>
  )
}
