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
      className={`relative mx-1 h-6 w-11 shrink-0 rounded-full border border-border transition-colors ${
        isDark ? 'bg-slate-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-150 ${
          isDark ? 'translate-x-5' : 'translate-x-0'
        }`}
        aria-hidden
      />
    </button>
  )
}

export default memo(ThemeSwitcher)
