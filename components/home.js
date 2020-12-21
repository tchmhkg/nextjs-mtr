import Link from 'next/link';
import useTranslation from '~/hooks/useTranslation';
import styled from 'styled-components';
import { stations } from '~/utils/next-train-data';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Axios from 'axios';
import Refresh from './refresh';
import { format, formatDuration, intervalToDuration } from 'date-fns';

const Heading = styled.h2`
  color: ${(props) => props.theme.text};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;
const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 769px) {
    flex-direction: row;
  }
`;

const ListWrapper = styled.div`
  height: 130px;
  overflow: auto;
  ul {
    margin: 0;
    li {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
    }
  }
`

const Left = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 160px;
  overflow: auto;
  ul {
    margin: 0;
  }
`;
const Right = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 160px;
  overflow: auto;
  ul {
    margin: 0;
  }
`;

const ResultLeft = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 160px;
`;
const ResultRight = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 160px;
`;

const Option = styled.li`
  background: ${({ selected, theme }) =>
    selected
      ? `linear-gradient(to right, ${theme.primary2}, ${theme.primary1})`
      : 'transparent'};
  color: ${({ selected, theme }) => selected ? '#fff' : theme.text};
  cursor: pointer;
`;

const PlatForm = styled.span`
  border-radius: 50%;
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.platformText};
  background-color: ${({ theme }) => theme.platformBackground};
`;

const Home = () => {
  const { locale, t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [data, setData] = useState(null);

  const humanDuration = (time = 0, locale = 'en') => {
    if (time === '0') return t('arriving');
    const duration = formatDuration(
      intervalToDuration({ start: 0, end: parseInt(time) * 1000 * 60 })
    );
    if(locale === 'zh') {
      return duration.replace(' hour', '小時').replace(' minutes', '分鐘')
    }
    return duration;
  };

  const humanTime = (time = new Date()) => {
    return format(new Date(time.replace(' ', 'T')), 'HH:mm')
  }

  const getLangCodeFromLocale = () => (locale === 'zh' ? 'tc' : 'en');

  const onChangeLine = (line) => {
    setSelectedLine(line);
    setSelectedStation(null);
  };
  const filterStations = () => {
    if (!selectedLine) return [];
    return stations.find((s) => s.line.code === selectedLine);
  };

  const onClickRefresh = () => {
    getData();
  };

  const getData = async () => {
    if (!selectedStation) return;
    const res = await Axios.get('/api/mtr/next-train', {
      params: {
        line: selectedLine,
        sta: selectedStation,
        lang: locale === 'zh' ? 'TC' : 'EN',
      },
    });
    console.log('data', res?.data?.data?.data);
    if (res?.data?.data?.data) {
      setData(res?.data?.data?.data[`${selectedLine}-${selectedStation}`]);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedStation]);

  return (
    <div>
      {/* <Link href="https://truman.vercel.app">
        {t('Click here to stock app')}
      </Link> */}
      {/* <br /> */}
      <Wrapper>
        <Header>
          <Heading>MTR Next Train</Heading>
          <Refresh onClick={onClickRefresh} />
        </Header>
        <SelectorWrapper>
          <Left>
            <ul>
              {stations.map((l) => (
                <Option
                  key={l.line.code}
                  onClick={() => onChangeLine(l.line.code)}
                  selected={l.line.code === selectedLine}
                >
                  {l.line.label[getLangCodeFromLocale()]}
                </Option>
              ))}
            </ul>
          </Left>
          <Right>
            <ul>
              {filterStations()?.stations?.map((s) => (
                <Option
                  key={s.code}
                  onClick={() => setSelectedStation(s.code)}
                  selected={s.code === selectedStation}
                >
                  {s.label[getLangCodeFromLocale()]}
                </Option>
              ))}
            </ul>
          </Right>
        </SelectorWrapper>
        <Wrapper>
          {data && (
            <>
              <p>
                {t('last update')}: {data?.curr_time}
              </p>
              <ResultWrapper>
                <ResultLeft>
                  {t('To')}: {t(data?.DOWN?.[0]?.dest)}
                  <ListWrapper>
                    <ul>
                      {data?.DOWN?.map((times) => (
                        <li key={times.seq}>
                          {humanTime(times?.time)} (
                          {humanDuration(times?.ttnt, locale)}){' '}
                          <PlatForm>{times?.plat}</PlatForm>
                        </li>
                      ))}
                    </ul>
                  </ListWrapper>
                </ResultLeft>
                <ResultRight>
                  {t('To')}: {t(data?.UP?.[0]?.dest)}
                  <ListWrapper>
                    <ul>
                      {data?.UP?.map((times) => (
                        <li key={times.seq}>
                          {humanTime(times?.time)} (
                          {humanDuration(times?.ttnt, locale)}){' '}
                          <PlatForm>{times?.plat}</PlatForm>
                        </li>
                      ))}
                    </ul>
                  </ListWrapper>
                </ResultRight>
              </ResultWrapper>
            </>
          )}
        </Wrapper>
      </Wrapper>
    </div>
  );
};
export default React.memo(Home);
