import React from 'react'

import useTranslation from '@hooks/useTranslation'
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

  return (
    <Wrapper left={left} right={right}>
      {label && `${t('To')}: ${label}`}
      <ListWrapper>
        {!delay ? (
          data?.length ? (
            data.map((times) => (
              <ResultItem
                key={times.seq}
                times={times}
                lineColor={lineColor}
                currTime={currTime}
              />
            ))
          ) : (
            t('End Service')
          )
        ) : (
          <div>{t('Service not available')}</div>
        )}
      </ListWrapper>
    </Wrapper>
  )
}

export default ResultList
