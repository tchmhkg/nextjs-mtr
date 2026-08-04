import { routing } from '@i18n/routing'
import { absoluteUrl, type SeoPath } from '@lib/seo'
import type { MetadataRoute } from 'next'

const PATHS: SeoPath[] = ['', '/settings', '/journey']

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const path of PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(locale, path),
        alternates: {
          languages: {
            'zh-Hant': absoluteUrl('tc', path),
            en: absoluteUrl('en', path),
            'x-default': absoluteUrl(routing.defaultLocale, path),
          },
        },
      })
    }
  }

  return entries
}
