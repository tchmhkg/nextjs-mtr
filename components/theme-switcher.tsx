'use client'

import { useTheme } from '@components/theme-provider'
import { useTranslations } from 'next-intl'
import { memo, useCallback } from 'react'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

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
      className={`relative mx-1 h-6 w-10 shrink-0 rounded-full border border-border transition-colors ${isDark ? 'bg-slate-600' : 'bg-slate-300'
        }`}
    >
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 text-ink"
        aria-hidden
      >
        <span className={isDark ? 'opacity-35' : 'opacity-90'}>
          <SunIcon />
        </span>
        <span className={isDark ? 'opacity-90' : 'opacity-35'}>
          <MoonIcon />
        </span>
      </span>
      <span
        className={`pointer-events-none absolute top-1/2 z-[1] size-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-150 ${isDark ? 'left-[calc(100%-1.125rem)]' : 'left-0.5'
          }`}
        aria-hidden
      />
    </button>
  )
}

export default memo(ThemeSwitcher)
