import { LanguageContext } from '@context/LanguageContext'
import { defaultLocale } from '@translations/config'
import strings from '@translations/strings'
import { useContext } from 'react'

export default function useTranslation() {
  const { locale } = useContext(LanguageContext)

  function t(key: string) {
    if (!strings?.[locale]?.[key]) {
      console.warn(`Translation '${key}' for locale '${locale}' not found.`)
    }
    return strings?.[locale]?.[key] || strings?.[defaultLocale]?.[key] || key
  }

  return {
    t,
    locale,
  }
}
