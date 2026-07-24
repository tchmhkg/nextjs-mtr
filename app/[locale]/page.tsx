import Home from '@components/home'
import Layout from '@components/layout'
import { routing } from '@i18n/routing'
import { getNextTrain } from '@lib/schedules/get-next-train'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

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
    title: t('appTitle'),
    robots: { index: false, follow: false },
  }
}

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>
  searchParams: Promise<{ line?: string; sta?: string }>
}>

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const sp = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  let initialSchedule = null
  if (sp.line && sp.sta) {
    try {
      initialSchedule = (
        await getNextTrain({
          mode: 'mtr',
          line: sp.line,
          sta: sp.sta,
          lang: locale,
        })
      ).data
    } catch {
      initialSchedule = null
    }
  }

  return (
    <Layout home>
      <Suspense fallback={null}>
        <Home
          heading={t('appTitle')}
          initialLineFromUrl={sp.line ?? null}
          initialStaFromUrl={sp.sta ?? null}
          initialSchedule={initialSchedule}
        />
      </Suspense>
    </Layout>
  )
}
