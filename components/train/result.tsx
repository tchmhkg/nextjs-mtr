'use client'

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import ScheduleNotice from '@components/train/schedule-notice'
import { usePageVisibility } from '@hooks/usePageVisibility'
import type { MessageKey } from '@i18n/message-key'
import type {
  ApiErrorCode,
  ApiErrorResponse,
  ApiSuccessResponse,
} from '@lib/schedules/contracts/api-response'
import type {
  NextTrainDto,
  TrainRouteRow,
} from '@lib/schedules/contracts/next-train.dto'
import {
  apiErrorToMessageKey,
  isScheduleFetchError,
  parseApiErrorCode,
  ScheduleFetchError,
} from '@lib/schedules/client-error'
import { CLIENT_SCHEDULE_POLL_MS } from '@lib/public-env'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceMtrTimestamp } from '@utils/mtr-time'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import ResultList from './result-list'

type ResultProps = Readonly<{
  line: string
  sta: string
  initialSchedule?: NextTrainDto | null
  initialScheduleFailed?: boolean
}>

async function fetchNextTrain(url: string): Promise<NextTrainDto> {
  const res = await fetch(url)
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
            lineColor={lineColor}
            delay={false}
            currTime={effectiveNow}
          />
        ) : null}
        {data.down && effectiveNow ? (
          <ResultList
            label={getRouteDestLabel(data.down)}
            data={data.down}
            lineColor={lineColor}
            delay={false}
            currTime={effectiveNow}
          />
        ) : null}
      </div>
    </>
  )
}

function useLastUpdatedFlash(lastUpdated?: string | null) {
  const [flashUpdate, setFlashUpdate] = useState(false)
  const receivedAtRef = useRef(Date.now())
  const lastUpdatedSeenRef = useRef<string | null>(null)

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
    setFlashUpdate(true)
    const id = window.setTimeout(() => setFlashUpdate(false), 600)
    return () => window.clearTimeout(id)
  }, [lastUpdated])

  return { flashUpdate, setFlashUpdate, receivedAtRef, lastUpdatedSeenRef }
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

async function refreshWithFallback(
  apiUrl: string,
  refetch: () => Promise<{ isError: boolean; error: unknown }>,
  t: (key: MessageKey) => string
): Promise<NextTrainDto | null> {
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
    }
    return null
  }
}

function Result({
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
    () => ['next-train', line, sta, lang] as const,
    [line, sta, lang]
  )

  const apiUrl = useMemo(() => {
    if (!line || !sta) return null
    const q = new URLSearchParams({ mode: 'mtr', line, sta, lang })
    return `/api/next-train?${q.toString()}`
  }, [line, sta, lang])

  const { data, error, isPending, isFetching, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchNextTrain(apiUrl!),
    enabled: Boolean(apiUrl),
    initialData: initialSchedule ?? undefined,
    refetchInterval: isVisible ? CLIENT_SCHEDULE_POLL_MS : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const { flashUpdate, setFlashUpdate, receivedAtRef, lastUpdatedSeenRef } =
    useLastUpdatedFlash(data?.lastUpdated)

  useEffect(() => {
    if (data) setSsrNotice(false)
  }, [data])

  useEffect(() => {
    if (!data?.lastUpdated || !isVisible) return
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [data?.lastUpdated, isVisible])

  const effectiveNow = useMemo(() => {
    if (!data?.lastUpdated) return undefined
    return advanceMtrTimestamp(
      data.lastUpdated,
      nowMs - receivedAtRef.current
    )
  }, [data?.lastUpdated, nowMs, receivedAtRef])

  const lineColor = useMemo(
    () => DATA.find((l) => l.line.code === line)?.line?.color,
    [line]
  )

  const getRouteDestLabel = useCallback(
    (routes: TrainRouteRow[] = []) => {
      if (!routes.length) return '-'
      const dests = Array.from(
        new Set(routes.map((r) => t(r.dest as MessageKey)))
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

  const retry = useCallback(() => {
    onManualRefresh().catch(() => {})
  }, [onManualRefresh])

  if (!line || !sta) return null
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
          className={`flex min-w-0 flex-1 items-center gap-1 rounded-md px-1 text-sm text-muted ${
            flashUpdate ? 'animate-flash-soft' : ''
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
