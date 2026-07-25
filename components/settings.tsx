'use client'

import { useFontSize } from '@components/font-size-provider'
import LanguageSwitcher from '@components/language-switcher'
import ThemeSwitcher from '@components/theme-switcher'
import { useTranslations } from 'next-intl'
import { Suspense, memo, useCallback } from 'react'

function SettingsRow({
  label,
  children,
}: Readonly<{
  label: string
  children: React.ReactNode
}>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 first:pt-0 last:border-b-0">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function FontSizeControl() {
  const t = useTranslations()
  const { decrease, increase, canDecrease, canIncrease } = useFontSize()

  const onDecrease = useCallback(() => {
    decrease()
  }, [decrease])

  const onIncrease = useCallback(() => {
    increase()
  }, [increase])

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDecrease}
          disabled={!canDecrease}
          aria-label={t('Decrease font size')}
          className="flex size-9 items-center justify-center rounded-md border border-border text-sm font-medium text-ink transition-colors enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          A−
        </button>
        <button
          type="button"
          onClick={onIncrease}
          disabled={!canIncrease}
          aria-label={t('Increase font size')}
          className="flex size-9 items-center justify-center rounded-md border border-border text-base font-semibold text-ink transition-colors enabled:hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          A+
        </button>
      </div>
      <p className="max-w-[14rem] text-right text-sm text-muted">
        {t('Font size preview')}
      </p>
    </div>
  )
}

function Settings() {
  const t = useTranslations()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">{t('Settings')}</h1>
      <div>
        <SettingsRow label={t('Language')}>
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </SettingsRow>
        <SettingsRow label={t('Theme')}>
          <ThemeSwitcher />
        </SettingsRow>
        <SettingsRow label={t('Font size')}>
          <FontSizeControl />
        </SettingsRow>
      </div>
    </div>
  )
}

export default memo(Settings)
