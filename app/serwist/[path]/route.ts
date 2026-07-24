import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { createSerwistRoute } from '@serwist/turbopack'

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout.trim() ||
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
