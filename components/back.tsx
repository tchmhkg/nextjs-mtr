'use client'

import { useRouter } from '@i18n/navigation'
import { localizedPath } from '@utils/locale-path'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

function BackButton({ backUrl = '' }: { backUrl?: string }) {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const onClickBack = useCallback(() => {
    if (backUrl) {
      router.push(localizedPath(locale, backUrl))
    } else {
      router.back()
    }
  }, [router, backUrl, locale])

  return (
    <div>
      <button
        type="button"
        onClick={onClickBack}
        aria-label={t('Back')}
        className="min-h-11 bg-transparent py-2 text-ink"
      >
        ← {t('Back')}
      </button>
    </div>
  )
}

export default React.memo(BackButton)
