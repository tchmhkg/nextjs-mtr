'use client'

import { APPLE_SPLASH } from '@lib/apple-splash'
import { useEffect } from 'react'

const ATTR = 'data-apple-splash'

/** Inject apple-touch-startup-image links on iOS only — avoids Chromium/SW fetching ~17 splash PNGs. */
export default function AppleSplashLinks() {
  useEffect(() => {
    if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) return
    if (document.head.querySelector(`link[${ATTR}]`)) return

    for (const { href, media } of APPLE_SPLASH) {
      const link = document.createElement('link')
      link.rel = 'apple-touch-startup-image'
      link.href = href
      link.media = media
      link.setAttribute(ATTR, '')
      document.head.appendChild(link)
    }
  }, [])

  return null
}
