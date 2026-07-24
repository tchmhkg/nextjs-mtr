/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { NetworkFirst, Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/next-train'),
      handler: new NetworkFirst({
        cacheName: 'next-train-api',
        networkTimeoutSeconds: 8,
        plugins: [
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
