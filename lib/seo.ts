import { htmlLang, routing, type AppLocale } from '@i18n/routing'
import { env } from '@lib/env'
import type { Metadata } from 'next'
import { hasLocale, type useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

/** English fallback for root layout (locale pages use i18n `appDescription`). */
export const SITE_DESCRIPTION_EN =
  'MTR and Light Rail schedules and journey times.'

/** Path without locale prefix: '' | '/settings' | '/journey' */
export type SeoPath = '' | '/settings' | '/journey'

type MessageKey = Parameters<ReturnType<typeof useTranslations>>[0]

function origin(): string {
  return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
}

/** Absolute URL for a route locale + path (as-needed prefix). */
export function absoluteUrl(locale: AppLocale, path: SeoPath): string {
  const base = origin()
  if (locale === routing.defaultLocale) {
    return path ? `${base}${path}` : `${base}/`
  }
  return path ? `${base}/${locale}${path}` : `${base}/${locale}`
}

export function pageAlternates(
  locale: AppLocale,
  path: SeoPath
): NonNullable<Metadata['alternates']> {
  return {
    canonical: absoluteUrl(locale, path),
    languages: {
      [htmlLang('tc')]: absoluteUrl('tc', path),
      [htmlLang('en')]: absoluteUrl('en', path),
      'x-default': absoluteUrl(routing.defaultLocale, path),
    },
  }
}

export function indexableRobots(): Metadata['robots'] {
  return { index: true, follow: true }
}

/** Validate locale from route params and set next-intl request locale. */
export async function localeFromParams(
  params: Promise<{ locale: string }>
): Promise<AppLocale> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  return locale
}

type PageMetadataKeys = Readonly<{
  title: MessageKey
  description: MessageKey
}>

/** Shared indexable title/description/OG/Twitter/canonical metadata. */
export async function pageMetadata(
  params: Promise<{ locale: string }>,
  path: SeoPath,
  keys: PageMetadataKeys
): Promise<Metadata> {
  const locale = await localeFromParams(params)
  const t = await getTranslations({ locale })
  const title = t(keys.title)
  const description = t(keys.description)
  return {
    title,
    description,
    robots: indexableRobots(),
    alternates: pageAlternates(locale, path),
    openGraph: { title, description },
    twitter: { title, description },
  }
}
