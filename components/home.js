import useTranslation from '~/hooks/useTranslation';
import styled from 'styled-components';
import { stations } from '~/utils/next-train-data';
import { useState } from 'react';
import Result from './train/result';

const Heading = styled.h2`
  color: ${(props) => props.theme.text};
  margin: 0 0 5px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 18px;
`;

const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Left = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 170px;
  overflow-y: auto;
`;
const Right = styled(Left)``;

const Option = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  .option-name {
    background: ${({ color, selected, theme }) =>
      selected ? `${color}` : 'transparent'};
    color: ${({ selected, theme }) => (selected ? '#fff' : theme.text)};
    width: 100%;
    padding: 3px;
  }
`;

const LineOption = styled(Option)`
  .option-name {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
`;

const StationOption = styled(Option)`
  background: ${({ color }) => color};
  &:first-child {
    border-top-right-radius: 8px;
  }
  &:last-child {
    border-bottom-right-radius: 8px;
  }
  padding: 3px;
  .option-name {
    background: ${({ selected }) =>
      selected ? '#fff' : 'transparent'} !important;
    color: ${({ selected }) => (selected ? '#000' : '#fff')} !important;
    border-radius: ${({ selected }) => (selected ? '8px' : 0)};
  }
`;

const LineColor = styled.div`
  width: 18px;
  height: 5px;
  background-color: ${({ color }) => color};
  border-radius: 5px;
  margin: 0 5px;
`;

const Home = () => {
  const { locale, t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const getLangCodeFromLocale = () => (locale === 'zh' ? 'tc' : 'en');

  const onChangeLine = (line) => {
    if (line === selectedLine) return;
    setSelectedLine(line);
    setSelectedStation(null);
  };
  const filterStations = () => {
    if (!selectedLine) return [];
    return stations.find((s) => s.line.code === selectedLine);
  };

  return (
    <Container>
      <Header>
        <Heading>MTR Next Train</Heading>
      </Header>
      <SelectorWrapper>
        <Left>
          {stations.map((l) => (
            <LineOption
              key={l.line.code}
              onClick={() => onChangeLine(l.line.code)}
              selected={l.line.code === selectedLine}
              color={l.line.color}
            >
              <LineColor color={l.line.color} />
              <div className="option-name">
                {l.line.label[getLangCodeFromLocale()]}
              </div>
            </LineOption>
          ))}
        </Left>
        <Right>
          {filterStations()?.stations?.map((s) => (
            <StationOption
              color={filterStations()?.line?.color}
              key={s.code}
              onClick={() => setSelectedStation(s.code)}
              selected={s.code === selectedStation}
            >
              <div className="option-name station">
                {s.label[getLangCodeFromLocale()]}
              </div>
            </StationOption>
          ))}
        </Right>
      </SelectorWrapper>
      <Result line={selectedLine} sta={selectedStation} />
    </Container>
  );
};
export default React.memo(Home);
