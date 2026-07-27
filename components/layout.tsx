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

/** Page chrome only — shell (Navbar / OfflineBanner / padding) lives in locale layout. */
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
      {back ? <BackButton backUrl={props.backUrl} /> : null}
      <main>{children}</main>
      {!home && showBackToHome ? (
        <div className="mt-6 text-sm">
          <Link href="/">← {t('Back to home')}</Link>
        </div>
      ) : null}
    </>
  )
}
