'use client'

import type { MessageKey } from '@i18n/message-key'
import type { IRelatedLine, IStation } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId } from 'react'

type Language = 'en' | 'tc'

function lang(locale: string): Language {
  return locale === 'tc' ? 'tc' : 'en'
}

type InterchangeDialogProps = {
  station: IStation
  onSelect: (lineCode: string, stationCode?: string) => void
  onClose: () => void
}

export default function InterchangeDialog({
  station,
  onSelect,
  onClose,
}: InterchangeDialogProps) {
  const t = useTranslations()
  const locale = useLocale()
  const l = lang(locale)
  const titleId = useId()
  const related = station.related ?? []

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const lineLabel = (r: IRelatedLine) => {
    const fromData = DATA.find((d) => d.line.code === r.lineCode)?.line.label[l]
    if (fromData) return fromData
    return t(r.lineCode as MessageKey)
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        aria-label={t('Close alert')}
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-md animate-sheet-in flex-col rounded-t-2xl border border-border bg-surface-alt shadow-xl md:animate-none md:rounded-2xl">
        <div className="flex justify-center pt-3 md:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>

        <header className="flex items-start justify-between gap-3 border-b border-border px-4 pb-3 pt-2 md:pt-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {t('Interchange')}
            </p>
            <h2
              id={titleId}
              className="truncate text-lg font-semibold tracking-tight text-ink"
            >
              {station.label[l]}
            </h2>
            <p className="mt-0.5 text-sm text-muted">{t('Transfer to')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
            aria-label={t('Close alert')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <ul className="max-h-[min(50vh,360px)] overflow-y-auto px-2 py-2">
          {related.map((r) => (
            <li key={r.lineCode}>
              <button
                type="button"
                onClick={() => onSelect(r.lineCode, r.stationCode)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface active:bg-surface"
              >
                <span
                  className="w-1 self-stretch rounded-full"
                  style={{ backgroundColor: r.color }}
                  aria-hidden
                />
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: r.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {lineLabel(r)}
                  </span>
                  <span className="block text-xs tabular-nums text-muted">
                    {r.lineCode}
                  </span>
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="shrink-0 text-muted"
                  aria-hidden
                >
                  <path
                    d="M6 3l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-ink"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
