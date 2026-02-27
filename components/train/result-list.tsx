import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import ResultItem from './result-item'
import { ListWrapper, Wrapper } from './result-list.style'

interface TrainTime {
  seq: string
  dest: string
  plat: string
  time: string
}

interface ResultListProps {
  left?: boolean
  right?: boolean
  label?: string
  data?: TrainTime[]
  lineColor: string
  delay?: boolean
  currTime?: string
}

const ResultList = ({
  left = false,
  right = false,
  label = '',
  data = [],
  lineColor,
  delay = false,
  currTime = null,
}: ResultListProps) => {
  const { t } = useTranslation()

  const renderResult = useCallback(() => {
    if (delay) {
      return <div>{t('Service not available')}</div>
    }
    if (!data?.length) {
      return <div>{t('End Service')}</div>
    }
    return data.map((times) => (
      <ResultItem
        key={times.seq}
        times={times}
        lineColor={lineColor}
        currTime={currTime || undefined}
      />
    ))
  }, [currTime, data, delay, lineColor, t])

  return (
    <Wrapper left={left} right={right}>
      <div className="label">{label && `${t('To')}: ${label}`}</div>
      <ListWrapper>{renderResult()}</ListWrapper>
    </Wrapper>
  )
}

export default React.memo(ResultList)
