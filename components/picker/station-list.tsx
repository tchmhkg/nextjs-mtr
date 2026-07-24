'use client'

import type { IStation } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import { forwardRef } from 'react'

type Language = 'en' | 'tc'

function lang(locale: string): Language {
  return locale === 'tc' ? 'tc' : 'en'
}

type StationListProps = Readonly<{
  stations: IStation[]
  selectedCode?: string | null
  lineColor: string
  onSelect: (station: IStation) => void
  onInterchange: (station: IStation) => void
  stationRefs: Record<string, React.RefObject<HTMLButtonElement | null>>
}>

const StationList = forwardRef<HTMLDivElement, StationListProps>(
  function StationList(
    {
      stations,
      selectedCode,
      lineColor,
      onSelect,
      onInterchange,
      stationRefs,
    },
    ref
  ) {
    const locale = useLocale()
    const t = useTranslations()
    const l = lang(locale)

    return (
      <div
        ref={ref}
        className="max-h-[min(36vh,260px)] overflow-y-auto md:max-h-[min(70vh,520px)]"
        aria-label={t('Select a station')}
      >
        {stations.map((s) => {
          const selected = s.code === selectedCode
          return (
            <div
              key={s.code}
              className={`flex min-h-9 items-stretch border-b border-border/60 last:border-b-0 ${
                selected ? 'bg-surface-alt' : ''
              }`}
            >
              <button
                ref={stationRefs[s.code]}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`${t('Select station')} ${s.label[l]}`}
                onClick={() => onSelect(s)}
                className="flex min-h-9 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm"
              >
                <span
                  className="w-1 self-stretch rounded-full"
                  style={{
                    backgroundColor: selected ? lineColor : 'transparent',
                  }}
                  aria-hidden
                />
                <span
                  className={
                    selected ? 'font-medium text-ink' : 'text-ink/90'
                  }
                >
                  {s.label[l]}
                </span>
              </button>
              {(s.related?.length ?? 0) > 0 ? (
                <button
                  type="button"
                  className="min-h-9 shrink-0 px-2.5 text-xs font-medium text-muted hover:text-ink"
                  onClick={() => onInterchange(s)}
                  aria-label={`${t('Show interchange options for')} ${s.label[l]}`}
                >
                  {t('Interchange')}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }
)

export default StationList
