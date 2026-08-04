import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tc', 'en'],
  defaultLocale: 'tc',
  localePrefix: 'as-needed',
  localeDetection: false,
  // Route codes (`tc`) are not BCP 47; HTML alternates use zh-Hant via lib/seo.
  alternateLinks: false,
})

export type AppLocale = (typeof routing.locales)[number]

/** BCP 47 tag for `<html lang>` — route codes (`tc`) are not valid lang values. */
export function htmlLang(locale: AppLocale): string {
  return locale === 'tc' ? 'zh-Hant' : 'en'
}
