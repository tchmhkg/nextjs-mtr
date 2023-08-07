import Head from 'next/head'

import Home from '@components/home'
import Layout from '@components/layout'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const Index = () => {
  // useEffect(() => {
  //   window.location.replace(`/${i18nextConfig.i18n.defaultLocale}`)
  // }, [])

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Layout home>
        <Home />
      </Layout>
    </>
  )
}

export default Index

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'tc')),
  },
})
