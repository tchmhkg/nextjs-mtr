'use client'

import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import { useTranslations } from 'next-intl'

type ModeToggleProps = Readonly<{
  mode: TransportMode
  onChange: (mode: TransportMode) => void
}>

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const t = useTranslations()

  return (
    <div
      className="mb-3 flex gap-1 rounded-lg border border-border bg-surface p-1"
      role="tablist"
      aria-label={t('Transport mode')}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'mtr'}
        onClick={() => onChange('mtr')}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          mode === 'mtr'
            ? 'bg-surface-alt text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        {t('MTR')}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'lr'}
        onClick={() => onChange('lr')}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          mode === 'lr'
            ? 'bg-surface-alt text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        {t('Light Rail')}
      </button>
    </div>
  )
}
