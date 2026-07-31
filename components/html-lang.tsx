'use client'

import { htmlLang, type AppLocale } from '@i18n/routing'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'

/** Sets <html lang> without an inline <script> (avoids React client script warning). */
export default function HtmlLang() {
  const locale = useLocale()
  useEffect(() => {
    document.documentElement.lang = htmlLang(locale as AppLocale)
  }, [locale])
  return null
}
