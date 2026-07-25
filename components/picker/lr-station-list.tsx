'use client'

import type { LrStation } from '@utils/lr-data'
import { useLocale, useTranslations } from 'next-intl'
import { forwardRef } from 'react'

export const LR_COLOR = '#D3A809'

type Language = 'en' | 'tc'

function lang(locale: string): Language {
  return locale === 'tc' ? 'tc' : 'en'
}

type LrStationListProps = Readonly<{
  stations: readonly LrStation[]
  selectedId?: string | null
  onSelect: (station: LrStation) => void
}>

const LrStationList = forwardRef<HTMLDivElement, LrStationListProps>(
  function LrStationList({ stations, selectedId, onSelect }, ref) {
    const locale = useLocale()
    const t = useTranslations()
    const l = lang(locale)

    return (
      <div
        ref={ref}
        className="max-h-[min(50vh,420px)] overflow-y-auto md:max-h-[min(70vh,560px)]"
        aria-label={t('Select a station')}
      >
        {stations.map((s) => {
          const selected = s.id === selectedId
          return (
            <button
              key={s.id}
              type="button"
              aria-current={selected ? 'true' : undefined}
              aria-label={`${t('Select station')} ${s.label[l]}`}
              onClick={() => onSelect(s)}
              className={`flex min-h-9 w-full items-center gap-2 border-b border-border/60 px-2 py-1.5 text-left text-sm last:border-b-0 ${selected ? 'bg-surface-alt' : ''
                }`}
            >
              <span
                className="w-1 self-stretch rounded-full"
                style={{
                  backgroundColor: selected ? LR_COLOR : 'transparent',
                }}
                aria-hidden
              />
              <span className={selected ? 'font-medium text-ink' : 'text-ink/90'}>
                {s.label[l]}
              </span>
              <span className="ml-auto text-xs tabular-nums text-muted">
                {s.code}
              </span>
            </button>
          )
        })}
      </div>
    )
  }
)

export default LrStationList
