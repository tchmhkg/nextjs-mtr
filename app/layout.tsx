import { APPLE_SPLASH } from '@lib/apple-splash'
import { env } from '@lib/env'
import '@styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC, Outfit } from 'next/font/google'
import { headers } from 'next/headers'
import NextTopLoader from 'nextjs-toploader'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
})

const notoSansTc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
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

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdr = await headers()
  const lang = hdr.get('x-next-intl-locale') ?? 'tc'
  // Only iOS needs apple-touch-startup-image; emitting all sizes on every visit
  // made Chromium + the service worker fetch ~17 unused splash PNGs at startup.
  const ua = hdr.get('user-agent') ?? ''
  const showAppleSplash = /iPhone|iPad|iPod/i.test(ua)

  return (
    <html
      lang={lang}
      dir="ltr"
      className={`${outfit.variable} ${notoSansTc.variable}`}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {showAppleSplash
          ? APPLE_SPLASH.map(({ href, media }) => (
              <link
                key={href + media}
                href={href}
                media={media}
                rel="apple-touch-startup-image"
              />
            ))
          : null}
      </head>
      <body>
        <NextTopLoader color="#333333" showSpinner={false} height={2} />
        {children}
      </body>
    </html>
  )
}
