'use client'

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import type { MessageKey } from '@i18n/message-key'
import type { ApiSuccessResponse } from '@lib/schedules/contracts/api-response'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
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

const fetcher = async (url: string): Promise<NextTrainDto> => {
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
  const apiUrl = useMemo(() => {
    if (!line || !sta) return null
    const lang = (locale || 'tc').toLowerCase()
    const q = new URLSearchParams({ mode: 'mtr', line, sta, lang })
    return `/api/next-train?${q.toString()}`
  }, [line, sta, locale])

  const { data, mutate } = useSWR(apiUrl, fetcher, {
    fallbackData: initialSchedule ?? undefined,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    dedupeInterval: 10000,
    errorRetryCount: 3,
  })

  const lineColor = useMemo(
    () => DATA.find((l) => l.line.code === line)?.line?.color,
    [line]
  )
  const [showAlert, setShowAlert] = useState(false)

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

  const onClickShowAlert = useCallback(() => setShowAlert(true), [])
  const onClickCloseAlert = useCallback(() => setShowAlert(false), [])

  const renderTrainLists = useCallback(() => {
    if (!data?.up && !data?.down) {
      return <div>{t('Service not available')}</div>
    }

    return (
      <>
        {data?.up && data?.lastUpdated && (
          <ResultList
            left
            label={getRouteDestLabel(data.up)}
            data={data.up}
            lineColor={lineColor}
            delay={data.isDelayed}
            currTime={data.lastUpdated}
          />
        )}
        {data?.down && data?.lastUpdated && (
          <ResultList
            right
            label={getRouteDestLabel(data.down)}
            data={data.down}
            lineColor={lineColor}
            delay={data.isDelayed}
            currTime={data.lastUpdated}
          />
        )}
      </>
    )
  }, [data, getRouteDestLabel, lineColor, t])

  useEffect(() => {
    if (line && sta) {
      mutate()
    }
  }, [line, sta, mutate])

  if (!line || !sta) return null
  if (line && sta && !data) return <div>{t('loading')}</div>
  return (
    <Wrapper>
      <Header>
        <LastUpdate>
          {data?.lastUpdated ? (
            <div className="last-update-time">
              {t('last update')}: {data.lastUpdated}
            </div>
          ) : null}
          {data?.alert ? <Bell onClick={onClickShowAlert} /> : null}
        </LastUpdate>
        <Refresh onClick={mutate} />
      </Header>
      {showAlert ? (
        <Alert onPressClose={onClickCloseAlert}>
          {data?.alert?.message}
          {data?.alert?.url ? (
            <a href={data?.alert?.url} target="_blank" rel="noreferrer">
              {t('more Info')}
            </a>
          ) : null}
        </Alert>
      ) : null}
      <ResultWrapper>
        {renderTrainLists()}
      </ResultWrapper>
    </Wrapper>
  )
}

export default React.memo(Result)
