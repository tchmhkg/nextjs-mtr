import { useTheme } from '@theme/theme'
import styles from '@components/layout.module.scss'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import NextHead from 'next/head'
import styled from 'styled-components'

const Head = dynamic(import('@components/head'))
const Navbar = dynamic(import('@components/navbar'))
const BackButton = dynamic(import('@components/back'))
const Link = dynamic(import('next/link'))

const Container = styled.div`
  overflow-y: auto;
  height: calc(100% - 50px);
  top: 50px;
  padding: 15px;
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
}) => {
  const { colors } = useTheme()
  const { i18n, t } = useTranslation()

  return (
    <>
      <NextHead>
        <meta name="theme-color" content={colors.backgroundAlt} />
      </NextHead>
      <Navbar />
      <Container>
        <Head />
        {back && <BackButton backUrl={props.backUrl} />}
        <main>{children}</main>
        {!home && showBackToHome && (
          <div className={styles.backToHome}>
            <Link href="/[lang]" as={`/${i18n.language}`}>
              <a>← {t('Back to home')}</a>
            </Link>
          </div>
        )}
      </Container>
    </>
  )
}

export default Layout
