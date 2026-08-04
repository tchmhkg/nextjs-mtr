import Journey from '@components/journey/journey'
import Layout from '@components/layout'
import { localeFromParams, pageMetadata } from '@lib/seo'
import type { Metadata } from 'next'

type PageParams = Readonly<{
  params: Promise<{ locale: string }>
}>

export function generateMetadata({ params }: PageParams): Promise<Metadata> {
  return pageMetadata(params, '/journey', {
    title: 'Journey',
    description: 'Journey description',
  })
}

export default async function JourneyPage({ params }: PageParams) {
  await localeFromParams(params)

  return (
    <Layout back backUrl="/" showBackToHome={false}>
      <Journey />
    </Layout>
  )
}
