import useTranslation from '~/hooks/useTranslation';
import styled from 'styled-components';
import { stations } from '~/utils/next-train-data';
import { useState, useEffect, useCallback, useRef, /*createRef*/ } from 'react';
import Result from './train/result';
import CurrLocation from './curr-location';

const Heading = styled.h2`
  color: ${(props) => props.theme.text};
  margin: 0;
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
  @media (max-width: 374px) {
    font-size: 16px;
  }
`;

const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 8px;
  overflow: hidden;
`;

const Left = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 170px;
  overflow-y: auto;
  margin-right: 3px;
`;
const Right = styled(Left)`
  background: ${({bgColor}) => bgColor || 'transparent'};
  border-radius: 8px;
  margin-left: 3px;
  margin-right: 0;
`;

const Option = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  .option-name {
    background: ${({ color, selected }) =>
      selected ? `${color}` : 'transparent'};
    color: ${({ selected, theme }) => (selected ? '#fff' : theme.text)};
    width: 100%;
    padding: 3px;
  }
`;

const LineOption = styled(Option)`
  .option-name {
    border-radius: 8px;
  }
`;

const StationOption = styled(Option)`
  background: ${({ color }) => color};
  padding: 3px;
  .option-name {
    background: ${({ selected }) =>
      selected ? '#fff' : 'transparent'} !important;
    color: ${({ selected }) => (selected ? '#000' : '#fff')} !important;
    border-radius: 8px;
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
  const rightListRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  // const [currLocation, setCurrLocation] = useState({lat: 0, lng: 0});
  // const [closestStation, setClosestStation] = useState({});
  // let stationRef = [];
  const refs = stations.reduce((stationRef, value) => {
    for(const station of value.stations) {
      stationRef[station.code] = React.createRef();
    }
    return stationRef;
  }, {});

  const getLangCodeFromLocale = () => (locale === 'zh' ? 'tc' : 'en');

  const onChangeLine = (line) => {
    if (line === selectedLine) return;
    setSelectedLine(line);
    setSelectedStation(null);
    rightListRef?.current?.scrollTo({top: 0});
  };
  const filterStations = () => {
    if (!selectedLine) return [];
    return stations.find((s) => s.line.code === selectedLine);
  };

  const getPositionSuccess = (pos) => {
    var crd = pos.coords;
  
    // console.log('Your current position is:');
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);
    // setCurrLocation({lat: crd.latitude, lng: crd.longitude});
    findNearestStation(crd.latitude, crd.longitude)
  }

  const getPositionError = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  const getCurrLocation = () => {
    var options = {
      enableHighAccuracy: true,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionError, options);
  }

  const findNearestStation = useCallback((lat, lng) => {
    if(!lat || !lng) return;
    let closest = null;
    let closestLine = null;
    let closestDistance = null;

    for(const lineStation of stations) {
      // console.log('LINE =>',lineStation.line.label.tc)
      for(const station of lineStation.stations) {
        const distance = calcDistance(lat, lng, station.location.lat, station.location.lng);
        if(!closest || distance < closestDistance){
          closestDistance = distance;
          closestLine = lineStation.line?.code;
          closest = station?.code;
        }
      }
    }
    // console.log('CLOSEST =>',closest);
    // setClosestStation(closest);
    setSelectedLine(closestLine);
    setSelectedStation(closest);
    setGettingLocation(true);
  }, [])

  useEffect(() => {
    getCurrLocation();
  }, [])

  useEffect(() => {
    if(gettingLocation) {
      scrollToStation();
      setGettingLocation(false);
    }
  }, [selectedStation, gettingLocation])

  const scrollToStation = () => {
    if(!selectedStation) return;
    refs[selectedStation]?.current?.scrollIntoView({
      // behavior: "smooth",
      block: "start"
    });
  }

  const calcDistance = (lat1, lon1, lat2, lon2, unit) => {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
  }

  return (
    <Container>
      <Header>
        <Heading>MTR Next Train</Heading>
        <CurrLocation onClick={getCurrLocation}/>
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
        <Right ref={rightListRef} bgColor={filterStations()?.line?.color}>
          {filterStations()?.stations?.map((s) => {
            {/* const ref = createRef();
            stationRef.push({[s.code]: ref}) */}
            return (
              <StationOption
                ref={refs[s.code]}
                key={s.code}
                onClick={() => setSelectedStation(s.code)}
                selected={s.code === selectedStation}
              >
                <div className="option-name station">
                  {s.label[getLangCodeFromLocale()]}
                </div>
              </StationOption>
            )
          })}
        </Right>
      </SelectorWrapper>
      <Result line={selectedLine} sta={selectedStation} />
    </Container>
  );
};
export default React.memo(Home);
