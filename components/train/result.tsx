import Axios from 'axios'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ILine, IStation } from '@store/slices/trainSlice'

interface ResultProps {
  line: string
  sta: string
}

interface ApiParams {
  line: string
  sta: string
  lang: string
}

interface TrainRoute {
  dest: string
  [key: string]: any
}

import Alert from '@components/alert'
import Bell from '@components/bell'
import Refresh from '@components/refresh'
import { MTR_NEXT_TRAIN_API } from '@utils/api-urls'
import { DATA } from '@utils/next-train-data'
import { useTranslation } from 'next-i18next'
import ResultList from './result-list'
import { Header, LastUpdate, ResultWrapper, Wrapper } from './result.style'

const fetcher = (url: string, params: ApiParams) =>
  Axios.get(url, { params }).then((res) => ({
    data: res?.data?.data?.[`${params?.line}-${params?.sta}`],
    isdelay: res?.data.isdelay === 'Y',
    curr_time: res?.data?.curr_time,
    alert:
      res?.data?.status === 0 && res?.data?.message
        ? {
          message: res?.data?.message, //"Special train service arrangements are now in place on this line. Please click here for more information.",
          url: res?.data?.url ? decodeURI(res?.data?.url) : null, //decodeURI("https:\/\/www.mtr.com.hk\/alert\/alert_title_wap.html")
        }
        : null,
  }))

const Result = ({ line, sta }: ResultProps) => {
  const { t, i18n } = useTranslation()
  const params = useMemo(
    () => ({ line, sta, lang: i18n.language?.toUpperCase() || 'TC' }),
    [i18n.language, line, sta]
  )
  const { data, mutate } = useSWR(
    line && sta ? MTR_NEXT_TRAIN_API : null,
    (url) => fetcher(url, params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupeInterval: 10000,
      retryCount: 3
    }
  )

  const lineColor = useMemo(
    () => DATA.find((l) => l.line.code === line)?.line?.color,
    [line]
  )
  const [showAlert, setShowAlert] = useState(false)

  const getRouteDestLabel = useCallback(
    (routes: TrainRoute[] = []) => {
      if (!routes?.length) return '-'
      const dests = Array.from(new Set([...routes.map((r) => t(r.dest))]))
      return dests.join(t('/'))
    },
    [t]
  )

  const onClickShowAlert = useCallback(() => setShowAlert(true), [])
  const onClickCloseAlert = useCallback(() => setShowAlert(false), [])

  useEffect(() => {
    if (sta) {
      mutate()
    }
  }, [sta])

  if (!line || !sta) return null
  if (line && sta && !data) return <div>{t('Loading...')}</div>
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
        {!data?.data?.UP && !data?.data?.DOWN ? (
          <div>{t('Service not available')}</div>
        ) : null}
        {data?.data?.UP && data?.curr_time ? (
          <ResultList
            left
            label={getRouteDestLabel(data.data.UP)}
            data={data.data.UP}
            lineColor={lineColor}
            delay={data.isdelay}
            currTime={data.curr_time}
          />
        ) : null}
        {data?.data?.DOWN && data?.curr_time ? (
          <ResultList
            right
            label={getRouteDestLabel(data.data.DOWN)}
            data={data.data.DOWN}
            lineColor={lineColor}
            delay={data.isdelay}
            currTime={data.curr_time}
          />
        ) : null}
      </ResultWrapper>
    </Wrapper>
  )
}

export default React.memo(Result)
