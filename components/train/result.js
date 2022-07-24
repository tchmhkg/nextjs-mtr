import Axios from 'axios'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'

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

const AlertButton = styled.button`
  appearance: none;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.buttonText};
  cursor: pointer;
  text-align: center;
  border-radius: 8px;
  &:hover: {
    opacity: 0.7;
  }
`

const Alert = styled.div`
  max-width: 500px;
  width: 100%;
  ${'' /* margin: 15px; */}
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.border};
  border-radius: 15px;
  box-shadow: 3px 3px 4px 2px rgba(0, 0, 0, 0.5);
  z-index: 1000;
`

const AlertContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`

const fetcher = (url, params) =>
  Axios.get(url, { params }).then((res) => ({
    data: res?.data?.data[`${params?.line}-${params?.sta}`],
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
          <div className="last-update-time">
            {t('last update')}: {data?.curr_time}
          </div>{' '}
          {data?.alert ? <Bell onClick={onClickShowAlert} /> : null}
        </LastUpdate>
        <Refresh onClick={mutate} />
      </Header>
      {showAlert ? (
        <AlertContainer onClick={onClickCloseAlert}>
          <Alert>
            {data?.alert?.message}
            {data?.alert?.url ? (
              <a href={data?.alert?.url} target="_blank" rel="noreferrer">
                {t('more Info')}
              </a>
            ) : null}
            <AlertButton onClick={onClickCloseAlert}>{t('close')}</AlertButton>
          </Alert>
        </AlertContainer>
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
