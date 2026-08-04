import Layout from '@components/layout'
import Settings from '@components/settings'
import { localeFromParams, pageMetadata } from '@lib/seo'
import type { Metadata } from 'next'

type PageParams = Readonly<{
  params: Promise<{ locale: string }>
}>

export function generateMetadata({ params }: PageParams): Promise<Metadata> {
  return pageMetadata(params, '/settings', {
    title: 'Settings',
    description: 'Settings description',
  })
}

export default async function SettingsPage({ params }: PageParams) {
  await localeFromParams(params)

  return (
    <Layout back backUrl="/" showBackToHome={false}>
      <Settings />
    </Layout>
  )
}
