import type { I18nConfig } from 'next-i18next/proxy'
import { defineConfig } from 'next-i18next/proxy'

const i18nConfig: I18nConfig = defineConfig({
  supportedLngs: ['tc', 'en'],
  fallbackLng: 'tc',
  defaultNS: 'common',
  ns: ['common'],
  hideDefaultLocale: true,
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
  ignoredPaths: ['/api', '/_next', '/static', '/monitoring'],
})

export default i18nConfig
