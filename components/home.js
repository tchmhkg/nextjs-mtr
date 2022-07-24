import useTranslation from '@hooks/useTranslation'
import { getTrainState, setLine, setStation } from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
import { stations } from '@utils/next-train-data'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import CurrLocation from './curr-location'
import Result from './train/result'

const Heading = styled.h2`
  color: ${(props) => props.theme.text};
  margin: 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 18px;
  @media (max-width: 374px) {
    font-size: 16px;
  }
`

const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 8px;
  overflow: hidden;
`

const Left = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 170px;
  overflow-y: auto;
  margin-right: 3px;
`
const Right = styled(Left)`
  background: ${({ bgColor }) => bgColor || 'transparent'};
  border-radius: 8px;
  margin-left: 3px;
  margin-right: 0;
`

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
`

const LineOption = styled(Option)`
  .option-name {
    border-radius: 8px;
  }
`

const StationOption = styled(Option)`
  background: ${({ color }) => color};
  padding: 3px;
  .option-name {
    background: ${({ selected }) =>
      selected ? '#fff' : 'transparent'} !important;
    color: ${({ selected }) => (selected ? '#000' : '#fff')} !important;
    border-radius: 8px;
  }
`

const LineColor = styled.div`
  width: 18px;
  height: 5px;
  background-color: ${({ color }) => color};
  border-radius: 5px;
  margin: 0 5px;
`

const Home = () => {
  const dispatch = useDispatch()
  const { line: selectedLine, station: selectedStation } =
    useSelector(getTrainState)
  const { locale, t } = useTranslation()
  const rightListRef = useRef(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  // const [currLocation, setCurrLocation] = useState({lat: 0, lng: 0});
  // const [closestStation, setClosestStation] = useState({});
  // let stationRef = [];
  const refs = stations.reduce((stationRef, value) => {
    for (const station of value.stations) {
      stationRef[station.code] = React.createRef()
    }
    return stationRef
  }, {})

  const langCodeFromLocale = useMemo(
    () => (locale === 'zh' ? 'tc' : 'en'),
    [locale]
  )

  const onChangeLine = useCallback(
    (line) => {
      if (line === selectedLine) return
      dispatch(setLine(line))
      dispatch(setStation(''))
      rightListRef?.current?.scrollTo({ top: 0 })
    },
    [selectedLine, dispatch]
  )
  const filterStations = useCallback(() => {
    if (!selectedLine) return []
    return stations.find((s) => s.line.code === selectedLine)
  }, [selectedLine])

  const calcDistance = useCallback((lat1, lon1, lat2, lon2, unit) => {
    var radlat1 = (Math.PI * lat1) / 180
    var radlat2 = (Math.PI * lat2) / 180
    var theta = lon1 - lon2
    var radtheta = (Math.PI * theta) / 180
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist)
    dist = (dist * 180) / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == 'K') {
      dist = dist * 1.609344
    }
    if (unit == 'N') {
      dist = dist * 0.8684
    }
    return dist
  }, [])

  const findNearestStation = useCallback(
    (lat, lng) => {
      if (!lat || !lng) return
      let closest = null
      let closestLine = null
      let closestDistance = null

      for (const lineStation of stations) {
        // console.log('LINE =>',lineStation.line.label.tc)
        for (const station of lineStation.stations) {
          const distance = calcDistance(
            lat,
            lng,
            station.location.lat,
            station.location.lng
          )
          if (!closest || distance < closestDistance) {
            closestDistance = distance
            closestLine = lineStation.line?.code
            closest = station?.code
          }
        }
      }
      // console.log('CLOSEST =>',closest);
      // setClosestStation(closest);
      dispatch(setLine(closestLine))
      dispatch(setStation(closest))
      setGettingLocation(true)
    },
    [calcDistance, dispatch]
  )

  const getPositionSuccess = useCallback(
    (pos) => {
      var crd = pos.coords

      // console.log('Your current position is:');
      // console.log(`Latitude : ${crd.latitude}`);
      // console.log(`Longitude: ${crd.longitude}`);
      // console.log(`More or less ${crd.accuracy} meters.`);
      // setCurrLocation({lat: crd.latitude, lng: crd.longitude});
      findNearestStation(crd.latitude, crd.longitude)
    },
    [findNearestStation]
  )

  const getPositionError = useCallback((err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`)
  }, [])

  const getCurrLocation = useCallback(() => {
    var options = {
      enableHighAccuracy: true,
      maximumAge: 0,
    }
    navigator.geolocation.getCurrentPosition(
      getPositionSuccess,
      getPositionError,
      options
    )
  }, [getPositionError, getPositionSuccess])

  const scrollToStation = useCallback(() => {
    if (!selectedStation) return
    refs[selectedStation]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [selectedStation, refs])

  useEffect(() => {
    getCurrLocation()
  }, [getCurrLocation])

  useEffect(() => {
    if (gettingLocation) {
      scrollToStation()
      setGettingLocation(false)
    }
  }, [selectedStation, gettingLocation, scrollToStation])

  return (
    <Container>
      <Header>
        <Heading>MTR Next Train</Heading>
        <CurrLocation onClick={getCurrLocation} />
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
                {l.line.label[langCodeFromLocale]}
              </div>
            </LineOption>
          ))}
        </Left>
        <Right ref={rightListRef} bgColor={filterStations()?.line?.color}>
          {filterStations()?.stations?.map((s) => {
            {
              /* const ref = createRef();
            stationRef.push({[s.code]: ref}) */
            }
            return (
              <StationOption
                ref={refs[s.code]}
                ß
                key={s.code}
                onClick={() => dispatch(setStation(s.code))}
                selected={s.code === selectedStation}
              >
                <div className="option-name station">
                  {s.label[langCodeFromLocale]}
                </div>
              </StationOption>
            )
          })}
        </Right>
      </SelectorWrapper>
      <Result line={selectedLine} sta={selectedStation} />
    </Container>
  )
}
export default React.memo(Home)
