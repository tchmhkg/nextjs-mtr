'use client'

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import ScheduleNotice from '@components/train/schedule-notice'
import { usePageVisibility } from '@hooks/usePageVisibility'
import type { MessageKey } from '@i18n/message-key'
import { CLIENT_SCHEDULE_POLL_MS } from '@lib/public-env'
import {
  apiErrorToMessageKey,
  isScheduleFetchError,
  parseApiErrorCode,
  ScheduleFetchError,
} from '@lib/schedules/client-error'
import type {
  ApiErrorCode,
  ApiErrorResponse,
  ApiSuccessResponse,
} from '@lib/schedules/contracts/api-response'
import type {
  NextTrainDto,
  TrainRouteRow,
} from '@lib/schedules/contracts/next-train.dto'
import { preferFreshThenPoll } from '@lib/schedules/prefer-fresh'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceMtrTimestamp } from '@utils/mtr-time'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import ResultList from './result-list'
import LrSchedulePanel from './lr-schedule-panel'

type ResultProps = Readonly<{
  mode?: 'mtr' | 'lr'
  line?: string
  sta: string
  initialSchedule?: NextTrainDto | null
  initialScheduleFailed?: boolean
}>

async function fetchNextTrain(url: string): Promise<NextTrainDto> {
  const res = await fetch(url, { cache: 'no-store' })
  let json: (ApiSuccessResponse<NextTrainDto> | ApiErrorResponse) | null = null
  try {
    json = (await res.json()) as ApiSuccessResponse<NextTrainDto> | ApiErrorResponse
  } catch {
    throw new ScheduleFetchError('UPSTREAM_ERROR', res.status || 503)
  }
  if (!res.ok || !json.success) {
    const code = parseApiErrorCode(
      json && !json.success ? json.error?.code : undefined
    )
    throw new ScheduleFetchError(code, res.status || 503)
  }
  return json.data
}

function errorCode(error: unknown): ApiErrorCode {
  if (isScheduleFetchError(error)) return error.code
  return 'UPSTREAM_ERROR'
}

type TrainListsProps = Readonly<{
  data: NextTrainDto
  effectiveNow?: string
  lineColor?: string
  getRouteDestLabel: (routes: TrainRouteRow[]) => string
}>

function TrainLists({
  data,
  effectiveNow,
  lineColor,
  getRouteDestLabel,
}: TrainListsProps) {
  const t = useTranslations()
  const color = lineColor ?? '#999'

  if (data.platforms?.length) {
    return <LrSchedulePanel data={data} />
  }

  if (!data.up && !data.down) {
    if (data.isDelayed) return <div>{t('Service delayed')}</div>
    return <div>{t('Service not available')}</div>
  }

  return (
    <>
      {data.isDelayed ? (
        <div className="mb-3 rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t('Service delayed')}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {data.up && effectiveNow ? (
          <ResultList
            label={getRouteDestLabel(data.up)}
            data={data.up}
            lineColor={color}
            delay={false}
            currTime={effectiveNow}
          />
        ) : null}
        {data.down && effectiveNow ? (
          <ResultList
            label={getRouteDestLabel(data.down)}
            data={data.down}
            lineColor={color}
            delay={false}
            currTime={effectiveNow}
          />
        ) : null}
      </div>
    </>
  )
}

function useLastUpdatedFlash(
  lastUpdated?: string | null,
  /** Reset live clock when line/sta changes — lastUpdated often matches across stations. */
  selectionKey = ''
) {
  const [flashUpdate, setFlashUpdate] = useState(false)
  const [clockEpoch, setClockEpoch] = useState(0)
  const receivedAtRef = useRef(Date.now())
  const lastUpdatedSeenRef = useRef<string | null>(null)
  const selectionKeySeenRef = useRef(selectionKey)

  // Ref adjust during render so the first frame after a station change
  // does not inherit elapsed time from the previous selection.
  if (selectionKeySeenRef.current !== selectionKey) {
    selectionKeySeenRef.current = selectionKey
    lastUpdatedSeenRef.current = null
    receivedAtRef.current = Date.now()
  }

  const mountedRef = useRef(false)
  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    // Sync wall-clock state after selection reset (refs alone do not re-render).
    setClockEpoch((n) => n + 1)
  }, [selectionKey])

  useEffect(() => {
    if (!lastUpdated) return
    if (lastUpdatedSeenRef.current === null) {
      lastUpdatedSeenRef.current = lastUpdated
      receivedAtRef.current = Date.now()
      return
    }
    if (lastUpdatedSeenRef.current === lastUpdated) return
    lastUpdatedSeenRef.current = lastUpdated
    receivedAtRef.current = Date.now()
    const flashOn = window.setTimeout(() => setFlashUpdate(true), 0)
    const flashOff = window.setTimeout(() => setFlashUpdate(false), 600)
    return () => {
      window.clearTimeout(flashOn)
      window.clearTimeout(flashOff)
    }
  }, [lastUpdated])

  return {
    flashUpdate,
    setFlashUpdate,
    receivedAtRef,
    lastUpdatedSeenRef,
    clockEpoch,
  }
}

function ResultColdFail({
  messageKey,
  onRetry,
  refreshing,
}: Readonly<{
  messageKey: MessageKey
  onRetry: () => void
  refreshing: boolean
}>) {
  const t = useTranslations()
  return (
    <section className="rounded-xl border border-border bg-surface-alt/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm text-muted">{t(messageKey)}</div>
        <Refresh onClick={onRetry} isRefreshing={refreshing} />
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-sm text-accent underline"
      >
        {t('Retry')}
      </button>
    </section>
  )
}

type RefetchResult = {
  isError: boolean
  error: unknown
  data?: NextTrainDto
}

async function refreshWithFallback(
  apiUrl: string,
  refetch: () => Promise<RefetchResult>,
  t: (key: MessageKey) => string,
  options?: { quiet?: boolean }
): Promise<NextTrainDto | null> {
  if (options?.quiet) {
    try {
      const { data } = await preferFreshThenPoll(
        () => fetchNextTrain(`${apiUrl}&fresh=1`),
        async () => {
          const result = await refetch()
          if (result.isError) throw result.error ?? new Error('poll failed')
          if (result.data === undefined) throw new Error('poll empty')
          return result.data
        }
      )
      return data
    } catch (err) {
      toast.error(t(apiErrorToMessageKey(errorCode(err))))
      return null
    }
  }

  try {
    return await fetchNextTrain(`${apiUrl}&fresh=1`)
  } catch (err) {
    const code = errorCode(err)
    if (code === 'RATE_LIMITED' || code === 'FORBIDDEN') {
      toast.error(t(apiErrorToMessageKey(code)))
      return null
    }
    const result = await refetch()
    if (result.isError) {
      toast.error(t(apiErrorToMessageKey(errorCode(result.error))))
      return null
    }
    return result.data ?? null
  }
}

function Result({
  mode = 'mtr',
  line,
  sta,
  initialSchedule,
  initialScheduleFailed = false,
}: ResultProps) {
  const locale = useLocale()
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isVisible = usePageVisibility()
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [showAlert, setShowAlert] = useState(false)
  const [manualRefreshing, setManualRefreshing] = useState(false)
  const [ssrNotice, setSsrNotice] = useState(initialScheduleFailed)

  const lang = (locale || 'tc').toLowerCase()
  const queryKey = useMemo(
    () => ['next-train', mode, line ?? '', sta, lang] as const,
    [mode, line, sta, lang]
  )

  const apiUrl = useMemo(() => {
    if (!sta) return null
    if (mode === 'mtr' && !line) return null
    const q = new URLSearchParams({ mode, sta, lang })
    if (line) q.set('line', line)
    return `/api/next-train?${q.toString()}`
  }, [mode, line, sta, lang])

  const { data, error, isPending, isFetching, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchNextTrain(apiUrl!),
    enabled: Boolean(apiUrl),
    initialData: initialSchedule ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: isVisible ? CLIENT_SCHEDULE_POLL_MS : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const selectionKey = `${mode}:${line ?? ''}:${sta}`
  const {
    flashUpdate,
    setFlashUpdate,
    receivedAtRef,
    lastUpdatedSeenRef,
    clockEpoch,
  } = useLastUpdatedFlash(data?.lastUpdated, selectionKey)

  useEffect(() => {
    if (data) setSsrNotice(false)
  }, [data])

  useEffect(() => {
    if (!data?.lastUpdated || !isVisible || mode === 'lr') return
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [data?.lastUpdated, isVisible, mode])

  // Sync wall clock when selection resets the ETA baseline (clockEpoch).
  useEffect(() => {
    setNowMs(Date.now())
  }, [clockEpoch])

  const effectiveNow = useMemo(() => {
    if (mode === 'lr' || !data?.lastUpdated) return undefined
    return advanceMtrTimestamp(
      data.lastUpdated,
      Math.max(0, nowMs - receivedAtRef.current)
    )
  }, [mode, data?.lastUpdated, nowMs, receivedAtRef, clockEpoch])

  const lineColor = useMemo(() => {
    if (mode === 'lr') return '#D3A809'
    return DATA.find((l) => l.line.code === line)?.line?.color
  }, [mode, line])

  const getRouteDestLabel = useCallback(
    (routes: TrainRouteRow[] = []) => {
      if (!routes.length) return '-'
      const dests = Array.from(
        new Set(
          routes.map((r) => r.destLabel?.trim() || t(r.dest as MessageKey))
        )
      )
      return dests.join(t('/'))
    },
    [t]
  )

  const onManualRefresh = useCallback(async () => {
    if (!apiUrl || manualRefreshing) return
    setManualRefreshing(true)
    try {
      const fresh = await refreshWithFallback(apiUrl, refetch, t)
      if (!fresh) return
      queryClient.setQueryData(queryKey, fresh)
      receivedAtRef.current = Date.now()
      lastUpdatedSeenRef.current = fresh.lastUpdated
      setFlashUpdate(true)
      setSsrNotice(false)
      window.setTimeout(() => setFlashUpdate(false), 600)
    } finally {
      setManualRefreshing(false)
    }
  }, [
    apiUrl,
    manualRefreshing,
    queryClient,
    queryKey,
    refetch,
    t,
    receivedAtRef,
    lastUpdatedSeenRef,
    setFlashUpdate,
  ])

  // Bypass CDN on station select — poll URL can serve s-maxage-stale ETAs.
  const selectFreshRef = useRef({
    apiUrl,
    refetch,
    queryKey,
    t,
    queryClient,
    receivedAtRef,
    lastUpdatedSeenRef,
    setFlashUpdate,
    setSsrNotice,
  })
  selectFreshRef.current = {
    apiUrl,
    refetch,
    queryKey,
    t,
    queryClient,
    receivedAtRef,
    lastUpdatedSeenRef,
    setFlashUpdate,
    setSsrNotice,
  }
  useEffect(() => {
    const ctx = selectFreshRef.current
    if (!ctx.apiUrl) return
    let cancelled = false
    ;(async () => {
      const fresh = await refreshWithFallback(ctx.apiUrl!, ctx.refetch, ctx.t, {
        quiet: true,
      })
      if (cancelled || !fresh) return
      ctx.queryClient.setQueryData(ctx.queryKey, fresh)
      ctx.receivedAtRef.current = Date.now()
      ctx.lastUpdatedSeenRef.current = fresh.lastUpdated
      ctx.setFlashUpdate(true)
      ctx.setSsrNotice(false)
      window.setTimeout(() => ctx.setFlashUpdate(false), 600)
    })().catch(() => {})
    return () => {
      cancelled = true
    }
  }, [selectionKey])

  const retry = useCallback(() => {
    onManualRefresh().catch(() => { })
  }, [onManualRefresh])

  if (!sta || (mode === 'mtr' && !line)) return null
  if (isPending && !data) {
    return <div className="text-muted">{t('loading')}</div>
  }

  const refreshing = manualRefreshing || isFetching
  const failKey = apiErrorToMessageKey(errorCode(error))

  if (isError && !data) {
    return (
      <ResultColdFail
        messageKey={failKey}
        onRetry={retry}
        refreshing={manualRefreshing}
      />
    )
  }

  return (
    <ResultPanel
      data={data}
      effectiveNow={effectiveNow}
      lineColor={lineColor}
      getRouteDestLabel={getRouteDestLabel}
      flashUpdate={flashUpdate}
      refreshing={refreshing}
      showAlert={showAlert}
      setShowAlert={setShowAlert}
      ssrNotice={ssrNotice}
      isError={isError}
      failKey={failKey}
      onRetry={retry}
    />
  )
}

type ResultPanelProps = Readonly<{
  data?: NextTrainDto
  effectiveNow?: string
  lineColor?: string
  getRouteDestLabel: (routes: TrainRouteRow[]) => string
  flashUpdate: boolean
  refreshing: boolean
  showAlert: boolean
  setShowAlert: (v: boolean) => void
  ssrNotice: boolean
  isError: boolean
  failKey: MessageKey
  onRetry: () => void
}>

function ResultPanel({
  data,
  effectiveNow,
  lineColor,
  getRouteDestLabel,
  flashUpdate,
  refreshing,
  showAlert,
  setShowAlert,
  ssrNotice,
  isError,
  failKey,
  onRetry,
}: ResultPanelProps) {
  const t = useTranslations()

  return (
    <section className="rounded-xl border border-border bg-surface-alt/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className={`flex min-w-0 flex-1 items-center gap-1 rounded-md px-1 text-sm text-muted ${flashUpdate ? 'animate-flash-soft' : ''
            }`}
        >
          <span className="truncate">
            {t('last update')}: {data?.lastUpdated ?? '—'}
            {refreshing ? (
              <span className="text-accent"> · {t('Refreshing')}</span>
            ) : null}
          </span>
          {data?.alert ? <Bell onClick={() => setShowAlert(true)} /> : null}
        </div>
        <Refresh onClick={onRetry} isRefreshing={refreshing} />
      </div>

      {showAlert ? (
        <Alert onPressClose={() => setShowAlert(false)}>
          {data?.alert?.message}
          {data?.alert?.url ? (
            <a
              href={data.alert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-accent underline"
            >
              {t('more Info')}
            </a>
          ) : null}
        </Alert>
      ) : null}

      {ssrNotice && !isError ? (
        <ScheduleNotice
          messageKey="Failed to load schedule"
          onRetry={onRetry}
        />
      ) : null}

      {isError && data ? (
        <ScheduleNotice messageKey={failKey} onRetry={onRetry} />
      ) : null}

      {data ? (
        <TrainLists
          data={data}
          effectiveNow={effectiveNow}
          lineColor={lineColor}
          getRouteDestLabel={getRouteDestLabel}
        />
      ) : null}
    </section>
  )
}

export default React.memo(Result)
