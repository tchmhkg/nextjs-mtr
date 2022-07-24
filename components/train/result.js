import Axios from 'axios'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'

import Alert from '@components/alert'
import Bell from '@components/Bell'
import Refresh from '@components/refresh'
import useTranslation from '@hooks/useTranslation'
import { MTR_NEXT_TRAIN_API } from '@utils/apiUrls'
import { stations } from '@utils/next-train-data'
import ResultList from './result-list'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ResultWrapper = styled(Wrapper)`
  @media (min-width: 769px) {
    flex-direction: row;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
`

const LastUpdate = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  .last-update-time {
    margin-right: 10px;
  }
`

const fetcher = (url, params) =>
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

const Result = ({ line, sta }) => {
  const { t, locale } = useTranslation()
  const params = useMemo(
    () => ({ line, sta, lang: locale === 'zh' ? 'TC' : 'EN' }),
    [line, sta, locale]
  )
  const { data, error, mutate } = useSWR(
    [line && sta ? MTR_NEXT_TRAIN_API : null, params],
    fetcher
  )
  const lineColor = useMemo(
    () => stations.find((l) => l.line.code === line)?.line?.color,
    [line]
  )
  const [showAlert, setShowAlert] = useState(false)

  const getRouteDestLabel = useCallback(
    (routes = []) => {
      if (!routes || !routes.length) return '-'
      ;``
      const dests = Array.from(new Set([...routes.map((r) => t(r.dest))]))
      return dests.join(t('/'))
    },
    [t]
  )

  const onClickShowAlert = useCallback(() => setShowAlert(true), [])
  const onClickCloseAlert = useCallback(() => setShowAlert(false), [])

  if (!line || !sta) return null
  if (line && sta && !data) return t('Loading...')
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
        <Alert onPress={onClickCloseAlert}>
          {data?.alert?.message}
          {data?.alert?.url ? (
            <a href={data?.alert?.url} target="_blank" rel="noreferrer">
              {t('more Info')}
            </a>
          ) : null}
        </Alert>
      ) : null}
      {/* {(data?.data?.UP?.length === 0 && data?.data?.DOWN?.length === 0) ? (
      <ResultWrapper>
        <ResultList
          label="-"
          data={[]}
          lineColor={lineColor}
        />
      </ResultWrapper>) : ( */}
      <ResultWrapper>
        {!data?.data?.UP && !data?.data?.DOWN ? (
          <div>{t('Service not available')}</div>
        ) : null}
        {data?.data?.UP ? (
          <ResultList
            left
            label={getRouteDestLabel(data?.data?.UP)}
            data={data?.data?.UP}
            lineColor={lineColor}
            delay={data?.isdelay}
            currTime={data?.curr_time}
          />
        ) : null}
        {data?.data?.DOWN ? (
          <ResultList
            right
            label={getRouteDestLabel(data?.data?.DOWN)}
            data={data?.data?.DOWN}
            lineColor={lineColor}
            delay={data?.isdelay}
            currTime={data?.curr_time}
          />
        ) : null}
      </ResultWrapper>
      {/* )} */}
    </Wrapper>
  )
}

export default Result
