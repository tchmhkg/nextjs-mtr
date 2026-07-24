import { z } from 'zod'

const DEFAULT_MTR_API =
  'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php'

const emptyToUndefined = (v: unknown) =>
  v === '' || v == null ? undefined : v

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
)

const positiveInt = (fallback: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(fallback)
  )

const nonNegInt = (fallback: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().nonnegative().default(fallback)
  )

const envSchema = z.object({
  MTR_NEXT_TRAIN_API_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default(DEFAULT_MTR_API)
  ),
  LR_NEXT_TRAIN_API_URL: z.preprocess(
    emptyToUndefined,
    z.string().default('')
  ),
  SCHEDULE_REVALIDATE_SECONDS: positiveInt(30),
  SCHEDULE_S_MAXAGE_SECONDS: positiveInt(30),
  SCHEDULE_STALE_WHILE_REVALIDATE_SECONDS: nonNegInt(60),
  ALERT_URL_ALLOWED_HOSTS: z.preprocess(
    emptyToUndefined,
    z.string().default('mtr.com.hk')
  ),
  FRESH_COOLDOWN_MS: nonNegInt(500),
  RATE_LIMIT_REQUESTS: positiveInt(60),
  RATE_LIMIT_WINDOW_MS: positiveInt(60_000),
  FRESH_RATE_LIMIT_REQUESTS: positiveInt(30),
  FRESH_RATE_LIMIT_WINDOW_MS: positiveInt(60_000),
  SW_NETWORK_TIMEOUT_MS: positiveInt(8_000),
  SW_MAX_ENTRIES: positiveInt(64),
  SW_MAX_AGE_SECONDS: positiveInt(86_400),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(
    emptyToUndefined,
    z.string().optional()
  ),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default('http://localhost:3000')
  ),
  NEXT_PUBLIC_SCHEDULE_POLL_MS: positiveInt(30_000),
  NEXT_PUBLIC_GITHUB_URL: optionalUrl,
})

export type AppEnv = z.infer<typeof envSchema>

function readEnv(): AppEnv {
  return envSchema.parse({
    MTR_NEXT_TRAIN_API_URL: process.env.MTR_NEXT_TRAIN_API_URL,
    LR_NEXT_TRAIN_API_URL: process.env.LR_NEXT_TRAIN_API_URL,
    SCHEDULE_REVALIDATE_SECONDS: process.env.SCHEDULE_REVALIDATE_SECONDS,
    SCHEDULE_S_MAXAGE_SECONDS: process.env.SCHEDULE_S_MAXAGE_SECONDS,
    SCHEDULE_STALE_WHILE_REVALIDATE_SECONDS:
      process.env.SCHEDULE_STALE_WHILE_REVALIDATE_SECONDS,
    ALERT_URL_ALLOWED_HOSTS: process.env.ALERT_URL_ALLOWED_HOSTS,
    FRESH_COOLDOWN_MS: process.env.FRESH_COOLDOWN_MS,
    RATE_LIMIT_REQUESTS: process.env.RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    FRESH_RATE_LIMIT_REQUESTS: process.env.FRESH_RATE_LIMIT_REQUESTS,
    FRESH_RATE_LIMIT_WINDOW_MS: process.env.FRESH_RATE_LIMIT_WINDOW_MS,
    SW_NETWORK_TIMEOUT_MS: process.env.SW_NETWORK_TIMEOUT_MS,
    SW_MAX_ENTRIES: process.env.SW_MAX_ENTRIES,
    SW_MAX_AGE_SECONDS: process.env.SW_MAX_AGE_SECONDS,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SCHEDULE_POLL_MS: process.env.NEXT_PUBLIC_SCHEDULE_POLL_MS,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
  })
}

/** Server-side config. Prefer not importing from client components. */
export const env = readEnv()

export function alertUrlAllowedHosts(): string[] {
  return env.ALERT_URL_ALLOWED_HOSTS.split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
}
