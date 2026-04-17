import Home from '@components/home'
import Layout from '@components/layout'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Next MTR Train',
    robots: { index: false, follow: false },
  }
}

export default function HomePage() {
  return (
    <Layout home>
      <Home />
    </Layout>
  )
}
