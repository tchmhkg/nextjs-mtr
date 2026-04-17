import AppProviders from '@components/app-providers'
import i18nConfig from '../../i18n.config'
import { I18nProvider } from 'next-i18next/client'
import {
  generateI18nStaticParams,
  getResources,
  getT,
  initServerI18next,
} from 'next-i18next/server'

initServerI18next(i18nConfig)

export async function generateStaticParams() {
  return generateI18nStaticParams().map(({ lng }) => ({ locale: lng }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { i18n } = await getT(undefined, { lng: locale })
  const resources = getResources(i18n, ['common'])

  return (
    <I18nProvider language={locale} resources={resources}>
      <AppProviders>{children}</AppProviders>
    </I18nProvider>
  )
}
