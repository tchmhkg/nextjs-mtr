import AppProviders from '@components/app-providers'
import AppleSplashLinks from '@components/apple-splash-links'
import HtmlLang from '@components/html-lang'
import Navbar from '@components/navbar'
import OfflineBanner from '@components/offline-banner'
import SerwistProviderWrapper from '@components/serwist-provider'
import { routing } from '@i18n/routing'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang />
      <AppleSplashLinks />
      <SerwistProviderWrapper>
        <AppProviders>
          <OfflineBanner />
          <Navbar />
          <div className="relative min-h-dvh overflow-y-auto p-[15px] pt-[calc(50px+env(safe-area-inset-top,0px))] pb-[calc(15px+env(safe-area-inset-bottom,0px))] pl-[calc(15px+env(safe-area-inset-left,0px))] pr-[calc(15px+env(safe-area-inset-right,0px))] text-ink">
            {children}
          </div>
        </AppProviders>
      </SerwistProviderWrapper>
    </NextIntlClientProvider>
  )
}
