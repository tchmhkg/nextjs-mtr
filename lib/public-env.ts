/**
 * Client-safe config. Zod defaults in lib/env.ts do not apply in the browser;
 * keep these fallbacks in sync with that schema.
 */

export const CLIENT_SCHEDULE_POLL_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_SCHEDULE_POLL_MS
  const n = raw ? Number(raw) : Number.NaN
  return Number.isFinite(n) && n > 0 ? n : 30_000
})()
