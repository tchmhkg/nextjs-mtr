import Home from '@components/home'
import Layout from '@components/layout'
import { routing } from '@i18n/routing'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import { getNextTrain } from '@lib/schedules/get-next-train'
import { isKnownLrStation } from '@utils/lr-data'
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
  searchParams: Promise<{
    mode?: string
    line?: string
    dir?: string
    sta?: string
  }>
}>

function parseMode(raw: string | undefined): TransportMode {
  return raw === 'lr' ? 'lr' : 'mtr'
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const sp = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const mode = parseMode(sp.mode)

  let initialSchedule = null
  let initialScheduleFailed = false

  if (mode === 'lr' && sp.sta && isKnownLrStation(sp.sta)) {
    try {
      initialSchedule = (
        await getNextTrain({
          mode: 'lr',
          sta: sp.sta,
          lang: locale,
        })
      ).data
    } catch {
      initialScheduleFailed = true
    }
  } else if (mode === 'mtr' && sp.line && sp.sta) {
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
      initialScheduleFailed = true
    }
  }

  return (
    <Layout home>
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4" aria-hidden>
            <div className="h-8 w-48 rounded bg-border/60" />
            <div className="h-10 w-full rounded bg-border/40" />
            <div className="h-40 w-full rounded bg-border/40" />
          </div>
        }
      >
        <Home
          heading={t('appTitle')}
          initialModeFromUrl={mode}
          initialLineFromUrl={sp.line ?? null}
          initialDirFromUrl={sp.dir ?? null}
          initialStaFromUrl={sp.sta ?? null}
          initialSchedule={initialSchedule}
          initialScheduleFailed={initialScheduleFailed}
        />
      </Suspense>
    </Layout>
  )
}
