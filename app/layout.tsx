import { env } from '@lib/env'
import '@styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-outfit',
})

const siteUrl = env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'NextMTRTrain',
  description: 'Get MTR Schedule',
  manifest: '/manifest.json',
  icons: {
    // One PNG + ico is enough; listing every size made SW/browser fetch them all.
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/assets/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    // default light theme → light chrome until ThemeProvider hydrates
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  twitter: {
    card: 'summary',
    title: 'NextMTRTrain',
    description: 'Get MTR Schedule',
    images: [`${siteUrl}/assets/icon-192x192.png`],
  },
  openGraph: {
    type: 'website',
    title: 'NextMTRTrain',
    description: 'Get MTR Schedule',
    siteName: 'NextMTRTrain',
    url: siteUrl,
    images: [`${siteUrl}/assets/icon-192x192.png`],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Matches --page-bg-color; ThemeProvider updates on mode toggle
  themeColor: '#e2e8f0',
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  // lang defaults to zh-Hant (tc); HtmlLang sets the real value after hydrate.
  // Splash links injected client-side on iOS only (see AppleSplashLinks).
  return (
    <html lang="zh-Hant" dir="ltr" suppressHydrationWarning className={outfit.variable}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
