'use client'

import type { ILine } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'

type Language = 'en' | 'tc'

function lang(locale: string): Language {
  return locale === 'tc' ? 'tc' : 'en'
}

type LinePickerProps = {
  selectedCode?: string | null
  onSelect: (line: ILine) => void
  /** horizontal chips (mobile) vs vertical rail (desktop) */
  variant: 'chips' | 'rail'
}

export default function LinePicker({
  selectedCode,
  onSelect,
  variant,
}: LinePickerProps) {
  const locale = useLocale()
  const t = useTranslations()
  const l = lang(locale)

  if (variant === 'chips') {
    return (
      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={t('Select train line')}
      >
        {DATA.map(({ line }) => {
          const selected = line.code === selectedCode
          return (
            <button
              key={line.code}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${t('Select')} ${line.label[l]}`}
              onClick={() => onSelect(line)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm transition-colors ${
                selected
                  ? 'border-ink bg-surface-alt text-ink shadow-sm'
                  : 'border-border bg-surface-alt/60 text-muted hover:border-ink/40 hover:text-ink'
              }`}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: line.color }}
                aria-hidden
              />
              {line.label[l]}
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
      aria-label={t('Select train line')}
    >
      {DATA.map(({ line }) => {
        const selected = line.code === selectedCode
        return (
          <button
            key={line.code}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${t('Select')} ${line.label[l]}`}
            onClick={() => onSelect(line)}
            className={`flex min-h-9 items-center gap-2 border-l-[3px] px-2 py-1.5 text-left text-sm transition-colors ${
              selected
                ? 'border-l-[color:var(--line)] bg-surface-alt text-ink'
                : 'border-l-transparent text-muted hover:bg-surface-alt/70 hover:text-ink'
            }`}
            style={
              selected
                ? ({ ['--line' as string]: line.color } as React.CSSProperties)
                : undefined
            }
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: line.color }}
              aria-hidden
            />
            <span className="leading-snug">{line.label[l]}</span>
          </button>
        )
      })}
    </div>
  )
}
