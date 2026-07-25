import Layout from '@components/layout'
import Settings from '@components/settings'
import { routing } from '@i18n/routing'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

type GenerateMetadataProps = Readonly<{
  params: Promise<{ locale: string }>
}>

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  return {
    title: t('Settings'),
    robots: { index: false, follow: false },
  }
}

type SettingsPageProps = Readonly<{
  params: Promise<{ locale: string }>
}>

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <Layout back backUrl="/" showBackToHome={false}>
      <Settings />
    </Layout>
  )
}
