import { format, formatDuration, intervalToDuration } from 'date-fns'
import { useCallback } from 'react'

import { useTranslation } from 'next-i18next'
import { PlatForm, PlatFormWrapper } from './result-item.style'
const isValidDate = (d) => d instanceof Date // && !isNaN(d)

const humanTime = (time = new Date()) => {
  return format(new Date(String(time).replace(' ', 'T')), 'HH:mm')
}

const ResultItem = ({ times, lineColor, currTime }) => {
  const { i18n, t } = useTranslation()
  const humanDuration = useCallback(
    (time = null, locale = 'tc') => {
      const start = new Date(Date.parse(time?.replace(/-/g, '/')))
      const end = new Date(Date.parse(currTime?.replace(/-/g, '/')))
      if (!isValidDate(start) || !isValidDate(end)) {
        return '-'
      }
      const diffMSeconds = start.getTime() - end.getTime()
      const diffSeconds = diffMSeconds / 1000
      if (diffSeconds <= 0) return t('leaving')
      if (diffSeconds <= 60) return t('arriving')
      const duration = formatDuration(
        intervalToDuration({ start: 0, end: diffMSeconds }), //parseInt(minutesToArrive) * 1000 * 60 })
        { format: ['hours', 'minutes'] }
      )
      if (locale === 'tc') {
        return duration
          .replace(/\shours|\shour/g, '小時')
          .replace(/\sminutes|\sminute/g, '分鐘')
          .replace(/\sseconds|\ssecond/g, '秒')
      }
      return duration
        .replace(/hours/g, 'hrs')
        .replace(/hour/g, 'hr')
        .replace(/minutes/g, 'mins')
        .replace(/minute/g, 'min')
        .replace(/seconds/g, 'secs')
    },
    [currTime, t]
  )

  return (
    <div className="list-item" key={times.seq}>
      <div className="item-dest">{t(times?.dest)}</div>
      <PlatFormWrapper>
        <PlatForm lineColor={lineColor}>{times?.plat}</PlatForm>
      </PlatFormWrapper>
      <div className="item-time">
        {humanTime(times?.time)} ({humanDuration(times?.time, i18n.language)})
      </div>
    </div>
  )
}

export default ResultItem
