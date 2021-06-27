import React from 'react';
import styled from 'styled-components';

import useTranslation from '~/hooks/useTranslation';
import ResultItem from './result-item';

const ListWrapper = styled.div`
  height: 160px;
  overflow: auto;
  padding: 5px 0;

  .list-item {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.border};
      padding: 3px 0;
    }
    &:hover {
      font-weight: bold;
    }
    .item-dest {
      flex: 0.7;
      @media (max-width: 374px) {
        flex: 0.6
      }
    }
    .item-time {
      flex: 1;
    }
    @media (max-width: 374px) {
      font-size: 15px;
    }
  }
`;

const Wrapper = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 5px;
  margin-left: ${({ right }) => (right ? '3px' : 0)};
  margin-right: ${({ left }) => (left ? '3px' : 0)};
`;

const ResultList = ({ left = false, right = false, label = '', data = [], lineColor }) => {
  const { t } = useTranslation();

  return (
    <Wrapper left={left} right={right}>
      {label && `${t('To')}: ${label}`}
      <ListWrapper>
        {data?.length ? data.map((times) => (
          <ResultItem key={times.seq} times={times} lineColor={lineColor}/>
        )) : t('End Service')}
      </ListWrapper>
    </Wrapper>
  );
};

export default ResultList;
