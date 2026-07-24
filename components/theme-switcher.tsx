'use client'

import { useTheme } from '@components/theme-provider'
import { useTranslations } from 'next-intl'
import { memo, useCallback } from 'react'

function ThemeSwitcher() {
  const { mode, toggle } = useTheme()
  const t = useTranslations()
  const isDark = mode === 'dark'

  const onClick = useCallback(() => {
    toggle()
  }, [toggle])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('Toggle theme')}
      aria-pressed={isDark}
      className={`relative mx-1 h-6 w-10 shrink-0 rounded-full border border-border transition-colors ${
        isDark ? 'bg-slate-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-150 ${
          isDark ? 'left-[calc(100%-1.125rem)]' : 'left-0.5'
        }`}
        aria-hidden
      />
    </button>
  )
}

export default memo(ThemeSwitcher)
