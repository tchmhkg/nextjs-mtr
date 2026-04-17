import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tc', 'en'],
  defaultLocale: 'tc',
  localePrefix: 'as-needed',
})
