'use client'

import { usePathname, useRouter } from '@i18n/navigation'
import { routing } from '@i18n/routing'
import { SUPPORTED_LOCALES } from '@utils/locale-path'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

type AppLocale = (typeof routing.locales)[number]

function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations()

  const handleLocaleChange = useCallback(
    (nextLocale: AppLocale) => {
      if (currentLocale === nextLocale) return
      router.replace(pathname, { locale: nextLocale })
    },
    [currentLocale, router, pathname]
  )

  return (
    <div className="flex items-center" role="group" aria-label={t('Language')}>
      {SUPPORTED_LOCALES.map((lng) => {
        const selected = lng === currentLocale
        return (
          <button
            key={lng}
            type="button"
            onClick={() => handleLocaleChange(lng)}
            aria-label={`${t('Language')}: ${t(lng)}`}
            aria-pressed={selected}
            className={`mx-0.5 flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-sm ${
              selected
                ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white'
                : 'bg-transparent text-ink'
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
