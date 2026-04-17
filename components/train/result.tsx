'use client'

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import type { MtrNextTrainParsed } from '@lib/mtr-next-train'
import { DATA } from '@utils/next-train-data'
import type { MessageKey } from '@i18n/message-key'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import ResultList from './result-list'
import { Header, LastUpdate, ResultWrapper, Wrapper } from './result.style'

interface ResultProps {
  line: string
  sta: string
  initialSchedule?: MtrNextTrainParsed | null
}

interface TrainRoute {
  dest: string
  [key: string]: unknown
}

type SwrTrainPayload = {
  data: MtrNextTrainParsed['data']
  isdelay: boolean
  curr_time: string | null
  alert: MtrNextTrainParsed['alert']
}

const fetcher = async (url: string): Promise<SwrTrainPayload> => {
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Request failed')
  }
  if (!json.success) {
    throw new Error(json.error || 'Request failed')
  }
  return {
    data: json.data,
    isdelay: json.isdelay,
    curr_time: json.curr_time,
    alert: json.alert,
  }
}

const Result = ({ line, sta, initialSchedule }: ResultProps) => {
  const locale = useLocale()
  const t = useTranslations()
  const apiUrl = useMemo(() => {
    if (!line || !sta) return null
    const lang = (locale || 'tc').toLowerCase()
    const q = new URLSearchParams({ line, sta, lang })
    return `/api/mtr/next-train?${q.toString()}`
  }, [line, sta, locale])

  const fallbackData = useMemo((): SwrTrainPayload | undefined => {
    if (!initialSchedule) return undefined
    return {
      data: initialSchedule.data,
      isdelay: initialSchedule.isdelay,
      curr_time: initialSchedule.curr_time,
      alert: initialSchedule.alert,
    }
  }, [initialSchedule])

  const { data, mutate } = useSWR(apiUrl, fetcher, {
    fallbackData,
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
        new Set([...routes.map((r) => t(r.dest as MessageKey))])
      )
      return dests.join(t('/'))
    },
    [t]
  )

  const onClickShowAlert = useCallback(() => setShowAlert(true), [])
  const onClickCloseAlert = useCallback(() => setShowAlert(false), [])

  const renderTrainLists = useCallback(() => {
    if (!data?.data?.UP && !data?.data?.DOWN) {
      return <div>{t('Service not available')}</div>
    }

    return (
      <>
        {data?.data?.UP && data?.curr_time && (
          <ResultList
            left
            label={getRouteDestLabel(data.data.UP)}
            data={data.data.UP}
            lineColor={lineColor}
            delay={data.isdelay}
            currTime={data.curr_time}
          />
        )}
        {data?.data?.DOWN && data?.curr_time && (
          <ResultList
            right
            label={getRouteDestLabel(data.data.DOWN)}
            data={data.data.DOWN}
            lineColor={lineColor}
            delay={data.isdelay}
            currTime={data.curr_time}
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
          {data?.curr_time ? (
            <div className="last-update-time">
              {t('last update')}: {data?.curr_time}
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
