import React, { useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import Axios from 'axios';

import { stations } from '~/utils/next-train-data';
import useTranslation from '~/hooks/useTranslation';
import ResultList from './result-list';
import Refresh from '~/components/refresh';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultWrapper = styled(Wrapper)`
  @media (min-width: 769px) {
    flex-direction: row;
  }
`;

const Header = styled.p`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const fetcher = (url, params) => Axios.get(url, {params}).then(res => res?.data?.data?.data[`${params?.line}-${params?.sta}`]);

const Result = ({ line, sta }) => {
  const { t, locale } = useTranslation();
  const params = useMemo(() => ({line, sta, lang: locale === 'zh' ? 'tc' : 'en'}), [line, sta, locale]);
  const { data, error, mutate } = useSWR([(line && sta) ? '/api/mtr/next-train' : null, params], fetcher);
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
          label={data?.DOWN?.[0]?.dest && t(`${data?.DOWN?.[0]?.dest}_DOWN`)}
          data={data?.DOWN}
          lineColor={lineColor}
        />
        <ResultList
          right
          label={data?.UP?.[0]?.dest && t(`${data?.UP?.[0]?.dest}_UP`)}
          data={data?.UP}
          lineColor={lineColor}
        />
      </ResultWrapper>
    </Wrapper>
  );
};

export default Result;
