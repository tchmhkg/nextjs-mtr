import { APPLE_SPLASH } from '@lib/apple-splash'
import { env } from '@lib/env'
import '@styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC, Outfit } from 'next/font/google'
import { headers } from 'next/headers'
import NextTopLoader from 'nextjs-toploader'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-outfit',
})

const notoSansTc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500'],
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
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
  const fontVars =
    lang === 'tc'
      ? `${outfit.variable} ${notoSansTc.variable}`
      : outfit.variable

  return (
    <html lang={lang} dir="ltr" className={fontVars}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {APPLE_SPLASH.map(({ href, media }) => (
          <link
            key={href + media}
            href={href}
            media={media}
            rel="apple-touch-startup-image"
          />
        ))}
      </head>
      <body>
        <NextTopLoader color="#333333" showSpinner={false} height={2} />
        {children}
      </body>
    </html>
  )
}
