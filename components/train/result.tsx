'use client'

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import { usePageVisibility } from '@hooks/usePageVisibility'
import type { MessageKey } from '@i18n/message-key'
import type { ApiSuccessResponse } from '@lib/schedules/contracts/api-response'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceMtrTimestamp } from '@utils/mtr-time'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ResultList from './result-list'
import { Header, LastUpdate, ResultWrapper, Wrapper } from './result.style'

interface ResultProps {
  line: string
  sta: string
  initialSchedule?: NextTrainDto | null
}

interface TrainRoute {
  dest: string
  [key: string]: unknown
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

const Result = ({ line, sta, initialSchedule }: ResultProps) => {
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
    refetchInterval: isVisible ? 30_000 : false,
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

  // ponytail: 1s interval for live ETA; ceiling is timer drift when backgrounded
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
    (routes: TrainRoute[] = []) => {
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

  const onClickShowAlert = useCallback(() => setShowAlert(true), [])
  const onClickCloseAlert = useCallback(() => setShowAlert(false), [])

  const renderTrainLists = useCallback(() => {
    if (!data?.up && !data?.down) {
      if (data?.isDelayed) return <div>{t('Service delayed')}</div>
      return <div>{t('Service not available')}</div>
    }

    return (
      <>
        {data?.isDelayed ? (
          <div className="delay-banner">{t('Service delayed')}</div>
        ) : null}
        {data?.up && effectiveNow ? (
          <ResultList
            left
            label={getRouteDestLabel(data.up)}
            data={data.up}
            lineColor={lineColor}
            delay={false}
            currTime={effectiveNow}
          />
        ) : null}
        {data?.down && effectiveNow ? (
          <ResultList
            right
            label={getRouteDestLabel(data.down)}
            data={data.down}
            lineColor={lineColor}
            delay={false}
            currTime={effectiveNow}
          />
        ) : null}
      </>
    )
  }, [data, effectiveNow, getRouteDestLabel, lineColor, t])

  if (!line || !sta) return null

  if (isPending && !data) return <div>{t('loading')}</div>

  const refreshing = manualRefreshing || isFetching

  if (isError && !data) {
    return (
      <Wrapper>
        <Header>
          <LastUpdate>
            <div className="last-update-time">{t('Failed to load schedule')}</div>
          </LastUpdate>
          <Refresh onClick={onManualRefresh} isRefreshing={manualRefreshing} />
        </Header>
        <ResultWrapper>
          <div>
            {error instanceof Error
              ? error.message
              : t('Service not available')}
          </div>
          <button type="button" onClick={() => void onManualRefresh()}>
            {t('Retry')}
          </button>
        </ResultWrapper>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Header>
        <LastUpdate $flash={flashUpdate}>
          {data?.lastUpdated ? (
            <div className="last-update-time">
              {t('last update')}: {data.lastUpdated}
              {refreshing ? (
                <span className="refreshing-hint"> · {t('Refreshing')}</span>
              ) : null}
            </div>
          ) : (
            <div className="last-update-time">{t('last update')}: —</div>
          )}
          {data?.alert ? <Bell onClick={onClickShowAlert} /> : null}
        </LastUpdate>
        <Refresh onClick={onManualRefresh} isRefreshing={refreshing} />
      </Header>
      {showAlert ? (
        <Alert onPressClose={onClickCloseAlert}>
          {data?.alert?.message}
          {data?.alert?.url ? (
            <a href={data.alert.url} target="_blank" rel="noreferrer">
              {t('more Info')}
            </a>
          ) : null}
        </Alert>
      ) : null}
      {isError && data ? (
        <div className="stale-error">
          {t('Failed to load schedule')}{' '}
          <button type="button" onClick={() => void onManualRefresh()}>
            {t('Retry')}
          </button>
        </div>
      ) : null}
      <ResultWrapper>{renderTrainLists()}</ResultWrapper>
    </Wrapper>
  )
}

export default React.memo(Result)
