export const DEFAULT_LOCALE = 'tc'
export const SUPPORTED_LOCALES = ['tc', 'en'] as const

/** Path without leading /en for the non-default locale (hideDefaultLocale). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname
}

/** User-facing path for a locale (default locale has no prefix). */
export function localizedPath(locale: string, pathname: string): string {
  const base = stripLocalePrefix(pathname)
  if (locale === DEFAULT_LOCALE) return base
  return base === '/' ? '/en' : `/en${base}`
}
