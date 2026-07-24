'use client'

import { usePathname, useRouter } from '@i18n/navigation'
import { routing } from '@i18n/routing'
import { SUPPORTED_LOCALES } from '@utils/locale-path'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

type AppLocale = (typeof routing.locales)[number]

function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentLocale = useLocale()
  const t = useTranslations()

  const handleLocaleChange = useCallback(
    (nextLocale: AppLocale) => {
      if (currentLocale === nextLocale) return
      const qs = searchParams.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, {
        locale: nextLocale,
      })
    },
    [currentLocale, router, pathname, searchParams]
  )

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label={t('Language')}
    >
      {SUPPORTED_LOCALES.map((lng) => {
        const selected = lng === currentLocale
        return (
          <button
            key={lng}
            type="button"
            onClick={() => handleLocaleChange(lng)}
            aria-label={`${t('Language')}: ${t(lng)}`}
            aria-pressed={selected}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              selected
                ? 'bg-ink text-[var(--surface-alt)]'
                : 'text-muted hover:bg-surface-alt hover:text-ink'
            }`}
          >
            {t(lng)}
          </button>
        )
      })}
    </div>
  )
}

export default React.memo(LanguageSwitcher)
