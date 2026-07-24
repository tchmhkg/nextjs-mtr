/**
 * Client-safe config. Zod defaults in lib/env.ts do not apply in the browser;
 * keep these fallbacks in sync with that schema.
 */

export const CLIENT_SCHEDULE_POLL_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_SCHEDULE_POLL_MS
  const n = raw ? Number(raw) : Number.NaN
  return Number.isFinite(n) && n > 0 ? n : 30_000
})()

/** Hide GitHub button when unset. */
export const CLIENT_GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || undefined

export const CLIENT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
