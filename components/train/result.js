import React, { useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import Axios from 'axios';

import { stations } from '~/utils/next-train-data';
import useTranslation from '~/hooks/useTranslation';
import ResultList from './result-list';
import Refresh from '~/components/refresh';
import { MTR_NEXT_TRAIN_API } from '~/utils/apiUrls';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultWrapper = styled(Wrapper)`
  @media (min-width: 769px) {
    flex-direction: row;
  }
`;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0;
`;

const fetcher = (url, params) => Axios.get(url, {params}).then(res => ({
  data: res?.data?.data[`${params?.line}-${params?.sta}`],
  isdelay: res?.data.isdelay === 'Y',
  curr_time: res?.data?.curr_time,
}));

const Result = ({ line, sta }) => {
  const { t, locale } = useTranslation();
  const params = useMemo(() => ({line, sta, lang: locale === 'zh' ? 'tc' : 'en'}), [line, sta, locale]);
  const { data, error, mutate } = useSWR([(line && sta) ? MTR_NEXT_TRAIN_API : null, params], fetcher);
  const lineColor = stations.find(l => l.line.code === line)?.line?.color;

  if(!line || !sta) return null;
  if(line && sta && !data) return t('Loading...');
  return (
    <Wrapper>
      <Header>
        {t('last update')}: {data?.curr_time}
        <Refresh onClick={mutate} />
      </Header>
      <ResultWrapper>
        <ResultList
          left
          label={data?.data?.DOWN?.[0]?.dest && t(`${data?.data?.DOWN?.[0]?.dest}_DOWN`)}
          data={data?.data?.DOWN}
          lineColor={lineColor}
          delay={data?.isdelay}
        />
        <ResultList
          right
          label={data?.data?.UP?.[0]?.dest && t(`${data?.data?.UP?.[0]?.dest}_UP`)}
          data={data?.data?.UP}
          lineColor={lineColor}
          delay={data?.isdelay}
        />
      </ResultWrapper>
    </Wrapper>
  );
};

export default Result;
