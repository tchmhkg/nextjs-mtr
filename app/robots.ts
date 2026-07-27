import type { MetadataRoute } from 'next'

/** Schedule app is private-use; keep crawlers out site-wide. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
