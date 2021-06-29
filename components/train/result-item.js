import React from 'react';
import styled from 'styled-components';
import { format, formatDuration, intervalToDuration } from 'date-fns';

import useTranslation from '~/hooks/useTranslation';

const PlatFormWrapper = styled.div`
  color: ${({ theme }) => theme.text};
  align-items: center;
  flex: 0.4;
`;

const PlatForm = styled.span`
  border-radius: 50%;
  display: inline-flex;
  width: 23px;
  height: 23px;
  font-size: 16px;
  align-items: center;
  justify-content: center;
  color: ${({ lineColor, theme }) => lineColor ? '#fff' : theme.platformText};
  background-color: ${({ lineColor, theme }) => lineColor ? lineColor : theme.platformBackground};
  margin-left: 5px;
`;

const ResultItem = ({ times, lineColor }) => {
  const { locale, t } = useTranslation();
  const humanDuration = (time = 0, locale = 'en') => {
    if (time === '1') return t('arriving');
    if (time === '0') return t('leaving');
    const duration = formatDuration(
      intervalToDuration({ start: 0, end: parseInt(time) * 1000 * 60 })
    );
    if (locale === 'zh') {
      return duration
        .replace(/\shours|\shour/g, '小時')
        .replace(/\sminutes|\sminute/g, '分鐘');
    }
    return duration
      .replace(/hours/g, 'hrs')
      .replace(/hour/g, 'hr')
      .replace(/minutes/g, 'mins')
      .replace(/minute/g, 'min');
  };

  const humanTime = (time = new Date()) => {
    return format(new Date(time.replace(' ', 'T')), 'HH:mm');
  };

  return (
    <div className="list-item" key={times.seq}>
      <div className="item-dest">{t(times?.dest)}</div>
      <PlatFormWrapper>
        <PlatForm lineColor={lineColor}>{times?.plat}</PlatForm>
      </PlatFormWrapper>
      <div className="item-time">
        {humanTime(times?.time)} ({humanDuration(times?.ttnt, locale)})
      </div>
    </div>
  );
};

export default ResultItem;
