import Home from '@components/home'
import Layout from '@components/layout'
import { routing } from '@i18n/routing'
import { isApiError } from '@lib/schedules/errors/api-error'
import { getNextTrain } from '@lib/schedules/get-next-train'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import { isKnownLrStation } from '@utils/lr-data'
import { isKnownLineSta } from '@utils/next-train-data'
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

async function loadInitialSchedule(
  mode: TransportMode,
  line: string | undefined,
  sta: string | undefined,
  lang: string
): Promise<{ schedule: NextTrainDto | null; failed: boolean }> {
  if (!sta) return { schedule: null, failed: false }
  if (mode === 'mtr') {
    if (!line || !isKnownLineSta(line, sta)) {
      return { schedule: null, failed: false }
    }
  } else if (!isKnownLrStation(sta)) {
    return { schedule: null, failed: false }
  }

  try {
    const { data } = await getNextTrain({ mode, line, sta, lang })
    return { schedule: data, failed: false }
  } catch (err) {
    if (isApiError(err) && err.status >= 400 && err.status < 500) {
      return { schedule: null, failed: true }
    }
    return { schedule: null, failed: true }
  }
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
  const lang = locale === 'en' ? 'en' : 'tc'
  const { schedule, failed } = await loadInitialSchedule(
    mode,
    sp.line,
    sp.sta,
    lang
  )

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
          initialSchedule={schedule}
          initialScheduleFailed={failed}
        />
      </Suspense>
    </Layout>
  )
}
