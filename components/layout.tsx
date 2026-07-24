'use client'

import OfflineBanner from '@components/offline-banner'
import Navbar from '@components/navbar'
import { Link } from '@i18n/navigation'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import React from 'react'

type LayoutProps = Readonly<{
  children: React.ReactNode
  home?: boolean
  showAvatar?: boolean
  back?: boolean
  showBackToHome?: boolean
  backUrl?: string
}>

const BackButton = dynamic(() => import('@components/back'))

export default function Layout({
  children,
  home,
  back = false,
  showBackToHome = true,
  ...props
}: LayoutProps) {
  const t = useTranslations()

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
