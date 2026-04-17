'use client'

import Head from '@components/head'
import styles from '@components/layout.module.scss'
import { localizedPath } from '@utils/locale-path'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useT } from 'next-i18next/client'
import styled from 'styled-components'
import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  home?: boolean
  showAvatar?: boolean
  back?: boolean
  showBackToHome?: boolean
  backUrl?: string
}

const Navbar = dynamic(import('@components/navbar'))
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
  const { i18n, t } = useT()

  return (
    <>
      <Navbar />
      <Container>
        <Head />
        {back && <BackButton backUrl={props.backUrl} />}
        <main>{children}</main>
        {!home && showBackToHome && (
          <div className={styles.backToHome}>
            <Link href={localizedPath(i18n.language, '/')}>
              ← {t('Back to home')}
            </Link>
          </div>
        )}
      </Container>
    </>
  )
}

export default Layout
