/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { ExpirationPlugin, NetworkFirst, Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

/** Literals — Serwist/esbuild does not inline process.env. Keep in sync with lib/env defaults. */
const SW_NETWORK_TIMEOUT_MS = 8000
const SW_MAX_ENTRIES = 64
const SW_MAX_AGE_SECONDS = 86_400

function isFreshNextTrain(url: URL): boolean {
  const fresh = url.searchParams.get('fresh')
  return fresh === '1' || fresh === 'true'
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => {
        if (url.pathname.startsWith('/monitoring')) return false
        if (!url.pathname.startsWith('/api/next-train')) return false
        if (isFreshNextTrain(url)) return false
        return true
      },
      handler: new NetworkFirst({
        cacheName: 'next-train-api',
        networkTimeoutSeconds: Math.max(
          1,
          Math.ceil(SW_NETWORK_TIMEOUT_MS / 1000)
        ),
        plugins: [
          new ExpirationPlugin({
            maxEntries: SW_MAX_ENTRIES,
            maxAgeSeconds: SW_MAX_AGE_SECONDS,
          }),
          {
            cacheWillUpdate: async ({ response }) =>
              response?.ok ? response : null,
          },
        ],
      }),
    },
    ...defaultCache,
  ],
})

serwist.addEventListeners()
