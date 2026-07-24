import { randomUUID } from 'node:crypto'

import { createSerwistRoute } from '@serwist/turbopack'

/** Prefer CI/commit SHA so we never spawn `git` (Sonar PATH rule). */
const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  randomUUID()

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: 'app/sw.ts',
    useNativeEsbuild: true,
    additionalPrecacheEntries: [
      { url: '/', revision },
      { url: '/manifest.json', revision },
      { url: '/assets/icon-192x192.png', revision },
      { url: '/assets/icon-512x512.png', revision },
    ],
  })
