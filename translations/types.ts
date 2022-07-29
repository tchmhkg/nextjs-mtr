import { locales } from './config'

export function isLocale(tested: string) {
  return locales.some((locale) => locale === tested)
}
