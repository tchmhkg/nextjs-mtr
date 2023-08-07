import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import ResultItem from './result-item'
import { ListWrapper, Wrapper } from './result-list.style'

const ResultList = ({
  left = false,
  right = false,
  label = '',
  data = [],
  lineColor,
  delay = false,
  currTime = null,
}) => {
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
        currTime={currTime}
      />
    ))
  }, [currTime, data, delay, lineColor, t])

  return (
    <Wrapper left={left} right={right}>
      {label && `${t('To')}: ${label}`}
      <ListWrapper>{renderResult()}</ListWrapper>
    </Wrapper>
  )
}

export default ResultList
