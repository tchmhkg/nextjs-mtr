import OfflineBanner from '@components/offline-banner'
import Navbar from '@components/navbar'
import BackButton from '@components/back'
import { Link } from '@i18n/navigation'
import { getTranslations } from 'next-intl/server'
import React from 'react'

type LayoutProps = Readonly<{
  children: React.ReactNode
  home?: boolean
  showAvatar?: boolean
  back?: boolean
  showBackToHome?: boolean
  backUrl?: string
}>

export default async function Layout({
  children,
  home,
  back = false,
  showBackToHome = true,
  ...props
}: LayoutProps) {
  const t = await getTranslations()

  return (
    <>
      <OfflineBanner />
      <Navbar />
      <div className="relative overflow-y-auto p-[15px] pt-[calc(50px+env(safe-area-inset-top,0px))] pb-[calc(15px+env(safe-area-inset-bottom,0px))] pl-[calc(15px+env(safe-area-inset-left,0px))] pr-[calc(15px+env(safe-area-inset-right,0px))] text-ink">
        {back ? <BackButton backUrl={props.backUrl} /> : null}
        <main>{children}</main>
        {!home && showBackToHome ? (
          <div className="mt-6 text-sm">
            <Link href="/">← {t('Back to home')}</Link>
          </div>
        ) : null}
      </div>
    </>
  )
}
