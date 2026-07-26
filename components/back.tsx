'use client'

import { useRouter } from '@i18n/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

function BackButton({ backUrl = '' }: Readonly<{ backUrl?: string }>) {
  const t = useTranslations()
  const router = useRouter()
  const onClickBack = useCallback(() => {
    if (backUrl) {
      // next-intl router prefixes locale; do not call localizedPath here
      router.push(backUrl)
    } else {
      router.back()
    }
  }, [router, backUrl])

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
