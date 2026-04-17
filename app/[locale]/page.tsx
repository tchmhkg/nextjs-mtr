import Home from '@components/home'
import Layout from '@components/layout'
import { fetchMtrNextTrain } from '@lib/mtr-next-train'
import { getT } from 'next-i18next/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const { t } = await getT(undefined, { lng: locale })
  return {
    title: t('appTitle'),
    robots: { index: false, follow: false },
  }
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ line?: string; sta?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const { t } = await getT(undefined, { lng: locale })

  let initialSchedule = null
  if (sp.line && sp.sta) {
    try {
      initialSchedule = await fetchMtrNextTrain({
        line: sp.line,
        sta: sp.sta,
        lang: locale,
      })
    } catch {
      initialSchedule = null
    }
  }

  return (
    <Layout home>
      <Home
        heading={t('appTitle')}
        initialLineFromUrl={sp.line ?? null}
        initialStaFromUrl={sp.sta ?? null}
        initialSchedule={initialSchedule}
      />
    </Layout>
  )
}
