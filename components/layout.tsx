'use client'

import Head from '@components/head'
import styles from '@components/layout.module.scss'
import Navbar from '@components/navbar'
import { Link } from '@i18n/navigation'
import { useTranslations } from 'next-intl'
import styled from 'styled-components'
import React from 'react'
import dynamic from 'next/dynamic'

interface LayoutProps {
  children: React.ReactNode
  home?: boolean
  showAvatar?: boolean
  back?: boolean
  showBackToHome?: boolean
  backUrl?: string
}

const BackButton = dynamic(import('@components/back'))

const Container = styled.div`
  overflow-y: auto;
  padding: 15px;
  padding-top: 50px;
  position: relative;
  color: ${(props) => props.theme.text};
  a {
    color: ${(props) => props.theme.text};
  }
`

const Layout = ({
  children,
  home,
  showAvatar = true,
  back = false,
  showBackToHome = true,
  ...props
}: LayoutProps) => {
  const t = useTranslations()

  return (
    <>
      <Navbar />
      <Container>
        <Head />
        {back && <BackButton backUrl={props.backUrl} />}
        <main>{children}</main>
        {!home && showBackToHome && (
          <div className={styles.backToHome}>
            <Link href="/">
              ← {t('Back to home')}
            </Link>
          </div>
        )}
      </Container>
    </>
  )
}

export default Layout
