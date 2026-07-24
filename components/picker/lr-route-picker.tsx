'use client'

import { LR_COLOR } from '@components/picker/lr-station-list'
import { LR_ROUTES } from '@utils/lr-data'
import { useTranslations } from 'next-intl'

type LrRoutePickerProps = Readonly<{
  selectedCode?: string | null
  onSelect: (routeCode: string) => void
  variant: 'chips' | 'rail'
}>

export default function LrRoutePicker({
  selectedCode,
  onSelect,
  variant,
}: LrRoutePickerProps) {
  const t = useTranslations()

  if (variant === 'chips') {
    return (
      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={t('Select a route')}
      >
        {LR_ROUTES.map((route) => {
          const selected = route.code === selectedCode
          return (
            <button
              key={route.code}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${t('Select')} ${route.code}`}
              onClick={() => onSelect(route.code)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm tabular-nums transition-colors ${selected
                  ? 'border-ink bg-surface-alt text-ink shadow-sm'
                  : 'border-border bg-surface-alt/60 text-muted hover:border-ink/40 hover:text-ink'
                }`}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: LR_COLOR }}
                aria-hidden
              />
              {route.code}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="flex max-h-[min(70vh,520px)] flex-col overflow-y-auto"
      role="tablist"
      aria-label={t('Select a route')}
    >
      {LR_ROUTES.map((route) => {
        const selected = route.code === selectedCode
        return (
          <button
            key={route.code}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${t('Select')} ${route.code}`}
            onClick={() => onSelect(route.code)}
            className={`flex items-center gap-2 border-b border-border/60 px-2 py-2 text-left text-sm tabular-nums last:border-b-0 ${selected ? 'bg-surface-alt font-medium text-ink' : 'text-ink/90'
              }`}
          >
            <span
              className="w-1 self-stretch rounded-full"
              style={{
                backgroundColor: selected ? LR_COLOR : 'transparent',
              }}
              aria-hidden
            />
            {route.code}
          </button>
        )
      })}
    </div>
  )
}
