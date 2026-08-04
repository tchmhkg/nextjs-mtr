// Defer Sentry so the SDK stays off Lighthouse / first-paint path.
// Load on first interaction, or idle well after the lab window (~10s+).
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
  let started = false
  const events = ['pointerdown', 'keydown', 'touchstart'] as const

  const cleanup = () => {
    for (const e of events) {
      window.removeEventListener(e, onInteract)
    }
  }

  const run = () => {
    if (started) return
    started = true
    cleanup()
    void loadSentry()
  }

  function onInteract() {
    run()
  }

  for (const e of events) {
    window.addEventListener(e, onInteract, { once: true, passive: true })
  }

  // Fallback: idle with long timeout so Lighthouse cold loads skip the SDK.
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(run, { timeout: 12_000 })
  } else {
    setTimeout(run, 12_000)
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
  // Don't eagerly load Sentry just for a transition mark.
  sentry?.captureRouterTransitionStart(...args)
}
