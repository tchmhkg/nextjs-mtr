import Journey from '@components/journey/journey'
import Layout from '@components/layout'
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
    title: t('Journey'),
  }
}

type JourneyPageProps = Readonly<{
  params: Promise<{ locale: string }>
}>

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <Layout back backUrl="/" showBackToHome={false}>
      <Journey />
    </Layout>
  )
}
