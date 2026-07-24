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
      className={`relative mx-1.5 h-7 w-12 rounded-full border border-border transition-colors ${
        isDark ? 'bg-slate-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-0.5'
        }`}
        aria-hidden
      />
    </button>
  )
}

export default memo(ThemeSwitcher)
