'use client'

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import { usePageVisibility } from '@hooks/usePageVisibility'
import type { MessageKey } from '@i18n/message-key'
import type { ApiSuccessResponse } from '@lib/schedules/contracts/api-response'
import type {
  NextTrainDto,
  TrainRouteRow,
} from '@lib/schedules/contracts/next-train.dto'
import { CLIENT_SCHEDULE_POLL_MS } from '@lib/public-env'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceMtrTimestamp } from '@utils/mtr-time'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ResultList from './result-list'

interface ResultProps {
  line: string
  sta: string
  initialSchedule?: NextTrainDto | null
}

async function fetchNextTrain(url: string): Promise<NextTrainDto> {
  const res = await fetch(url)
  const json = (await res.json()) as ApiSuccessResponse<NextTrainDto> & {
    error?: { message?: string }
  }
  if (!res.ok || !json.success) {
    throw new Error(
      typeof json.error === 'object' ? json.error?.message : 'Request failed'
    )
  }
  return json.data
}

function Result({ line, sta, initialSchedule }: ResultProps) {
  const locale = useLocale()
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isVisible = usePageVisibility()
  const [tick, setTick] = useState(0)
  const [flashUpdate, setFlashUpdate] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [manualRefreshing, setManualRefreshing] = useState(false)
  const receivedAtRef = useRef(Date.now())
  const lastUpdatedSeenRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (!data?.lastUpdated) return
    if (lastUpdatedSeenRef.current === null) {
      lastUpdatedSeenRef.current = data.lastUpdated
      receivedAtRef.current = Date.now()
      return
    }
    if (lastUpdatedSeenRef.current !== data.lastUpdated) {
      lastUpdatedSeenRef.current = data.lastUpdated
      receivedAtRef.current = Date.now()
      setFlashUpdate(true)
      const id = window.setTimeout(() => setFlashUpdate(false), 600)
      return () => window.clearTimeout(id)
    }
  }, [data?.lastUpdated])

  useEffect(() => {
    if (!data?.lastUpdated || !isVisible) return
    const id = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [data?.lastUpdated, isVisible])

  const effectiveNow = useMemo(() => {
    void tick
    if (!data?.lastUpdated) return undefined
    return advanceMtrTimestamp(
      data.lastUpdated,
      Date.now() - receivedAtRef.current
    )
  }, [data?.lastUpdated, tick])

  const lineColor = useMemo(
    () => DATA.find((l) => l.line.code === line)?.line?.color,
    [line]
  )

  const getRouteDestLabel = useCallback(
    (routes: TrainRouteRow[] = []) => {
      if (!routes?.length) return '-'
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
      const fresh = await fetchNextTrain(`${apiUrl}&fresh=1`)
      queryClient.setQueryData(queryKey, fresh)
      receivedAtRef.current = Date.now()
      lastUpdatedSeenRef.current = fresh.lastUpdated
      setFlashUpdate(true)
      window.setTimeout(() => setFlashUpdate(false), 600)
    } catch {
      await refetch()
    } finally {
      setManualRefreshing(false)
    }
  }, [apiUrl, manualRefreshing, queryClient, queryKey, refetch])

  const renderTrainLists = useCallback(() => {
    if (!data?.up && !data?.down) {
      if (data?.isDelayed) return <div>{t('Service delayed')}</div>
      return <div>{t('Service not available')}</div>
    }

    return (
      <>
        {data?.isDelayed ? (
          <div className="mb-3 rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {t('Service delayed')}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {data?.up && effectiveNow ? (
            <ResultList
              label={getRouteDestLabel(data.up)}
              data={data.up}
              lineColor={lineColor}
              delay={false}
              currTime={effectiveNow}
            />
          ) : null}
          {data?.down && effectiveNow ? (
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
  }, [data, effectiveNow, getRouteDestLabel, lineColor, t])

  if (!line || !sta) return null

  if (isPending && !data) {
    return <div className="text-muted">{t('loading')}</div>
  }

  const refreshing = manualRefreshing || isFetching

  if (isError && !data) {
    return (
      <section className="rounded-xl border border-border bg-surface-alt/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm text-muted">{t('Failed to load schedule')}</div>
          <Refresh onClick={onManualRefresh} isRefreshing={manualRefreshing} />
        </div>
        <div className="text-sm">
          {error instanceof Error
            ? error.message
            : t('Service not available')}
        </div>
        <button
          type="button"
          onClick={() => void onManualRefresh()}
          className="mt-3 text-sm text-accent underline"
        >
          {t('Retry')}
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-surface-alt/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className={`flex min-w-0 flex-1 items-center gap-1 rounded-md px-1 text-sm text-muted ${
            flashUpdate ? 'animate-flash-soft' : ''
          }`}
        >
          {data?.lastUpdated ? (
            <span className="truncate">
              {t('last update')}: {data.lastUpdated}
              {refreshing ? (
                <span className="text-accent"> · {t('Refreshing')}</span>
              ) : null}
            </span>
          ) : (
            <span>
              {t('last update')}: —
            </span>
          )}
          {data?.alert ? <Bell onClick={() => setShowAlert(true)} /> : null}
        </div>
        <Refresh onClick={onManualRefresh} isRefreshing={refreshing} />
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

      {isError && data ? (
        <div className="mb-3 text-sm text-amber-700 dark:text-amber-300">
          {t('Failed to load schedule')}{' '}
          <button
            type="button"
            onClick={() => void onManualRefresh()}
            className="underline"
          >
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {renderTrainLists()}
    </section>
  )
}

export default React.memo(Result)
