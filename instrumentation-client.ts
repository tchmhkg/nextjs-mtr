// Defer Sentry so the SDK is off the critical path for Lighthouse / first paint.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

type SentryModule = typeof import('@sentry/nextjs')

let sentry: SentryModule | null = null
let loading: Promise<SentryModule> | null = null

function loadSentry(): Promise<SentryModule> {
  if (sentry) return Promise.resolve(sentry)
  loading ??= import('@sentry/nextjs').then((mod) => {
    mod.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      integrations: [],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
      // Replay disabled — session replay was the largest client JS cost.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      debug: false,
    })
    sentry = mod
    return mod
  })
  return loading
}

function scheduleSentryInit() {
  const run = () => {
    void loadSentry()
  }
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(run, { timeout: 4000 })
  } else {
    setTimeout(run, 2000)
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    scheduleSentryInit()
  } else {
    window.addEventListener('load', scheduleSentryInit, { once: true })
  }
}

export function onRouterTransitionStart(
  ...args: Parameters<SentryModule['captureRouterTransitionStart']>
) {
  if (sentry) {
    sentry.captureRouterTransitionStart(...args)
    return
  }
  void loadSentry().then((mod) => {
    mod.captureRouterTransitionStart(...args)
  })
}
