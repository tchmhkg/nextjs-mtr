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
    // Only add entries Serwist does not already pick up from public/.
    // Duplicating /manifest.json (public file hash vs commit SHA) throws
    // add-to-cache-list-conflicting-entries during SW evaluation.
    additionalPrecacheEntries: [{ url: '/', revision }],
  })
