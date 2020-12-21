import useTranslation from '~/hooks/useTranslation';
import styled from 'styled-components';
import { stations } from '~/utils/next-train-data';
import { useEffect, useState } from 'react';
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
  height: 160px;
  overflow: auto;
  padding: 5px 0;

  .list-item {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    &:not(:last-child) {
      border-bottom: 1px solid ${({theme})=>theme.border};
      padding: 3px 0;
    }
    &:hover {
      font-weight: bold;
    }
  }
`

const Left = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 165px;
  overflow: auto;
  margin-right: 3px;
`;
const Right = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 165px;
  overflow: auto;
  margin-left: 3px;
`;

const ResultLeft = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 5px;
  margin-right: 3px;
`;
const ResultRight = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 5px;
  margin-left: 3px;
`;

const Option = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  .option-name {
    background: ${({ selected, theme }) =>
      selected
        ? `linear-gradient(to right, ${theme.primary2}, ${theme.primary1})`
        : 'transparent'};
    color: ${({ selected, theme }) => selected ? '#fff' : theme.text};
    width: 100%;
    padding: 3px;
  }
`;
const PlatFormWrapper = styled.div`
  color: ${({ theme }) => theme.text};
  align-items: center;
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
  margin-left: 5px;
`;

const LineColor = styled.div`
  width: 18px;
  height: 5px;
  background-color: ${({color}) => color};
  border-radius: 5px;
  margin: 0 5px;
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
      return duration.replace(/\shours|\shour/g, '小時').replace(/\sminutes|\sminute/g, '分鐘')
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
    if (res?.data?.data?.data) {
      setData(res?.data?.data?.data[`${selectedLine}-${selectedStation}`]);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedStation]);

  return (
      <Wrapper>
        <Header>
          <Heading>MTR Next Train</Heading>
          <Refresh onClick={onClickRefresh} />
        </Header>
        <SelectorWrapper>
          <Left>
              {stations.map((l) => (
                <Option
                  key={l.line.code}
                  onClick={() => onChangeLine(l.line.code)}
                  selected={l.line.code === selectedLine}
                >
                  <LineColor color={l.line.color}/><div className="option-name">{l.line.label[getLangCodeFromLocale()]}</div>
                </Option>
              ))}
          </Left>
          <Right>
              {filterStations()?.stations?.map((s) => (
                <Option
                  key={s.code}
                  onClick={() => setSelectedStation(s.code)}
                  selected={s.code === selectedStation}
                >
                  <div className="option-name">{s.label[getLangCodeFromLocale()]}</div>
                </Option>
              ))}
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
                  {t('To')}: {data?.DOWN?.[0]?.dest && t(data?.DOWN?.[0]?.dest)}
                  <ListWrapper>
                      {data?.DOWN?.map((times) => (
                        <div className="list-item" key={times.seq}>
                          {humanTime(times?.time)} (
                          {humanDuration(times?.ttnt, locale)}){' '}
                          <PlatFormWrapper>
                            {t('Platform')}
                            <PlatForm>{times?.plat}</PlatForm>
                          </PlatFormWrapper>
                        </div>
                      ))}
                  </ListWrapper>
                </ResultLeft>
                <ResultRight>
                  {t('To')}: {data?.UP?.[0]?.dest && t(data?.UP?.[0]?.dest)}
                  <ListWrapper>
                      {data?.UP?.map((times) => (
                        <div className="list-item" key={times.seq}>
                          {humanTime(times?.time)} (
                          {humanDuration(times?.ttnt, locale)}){' '}
                          <PlatFormWrapper>
                            {t('Platform')}
                            <PlatForm>{times?.plat}</PlatForm>
                          </PlatFormWrapper>
                        </div>
                      ))}
                  </ListWrapper>
                </ResultRight>
              </ResultWrapper>
            </>
          )}
        </Wrapper>
      </Wrapper>
  );
};
export default React.memo(Home);
