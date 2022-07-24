import { getInitialLocale } from '@translations/getInitialLocale'
import Head from 'next/head'
import { useEffect } from 'react'

const Index = () => {
  useEffect(() => {
    window.location.replace(`/${getInitialLocale()}`)
  })

  return (
    <Head>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  )
}

export default Index
