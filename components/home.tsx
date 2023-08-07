import Alert from '@components/alert'
import {
  getTrainState,
  ILine,
  setLine,
  setStation,
} from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
import { DATA, ILineStation } from '@utils/next-train-data'
import _ from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CurrLocation from './curr-location'
import {
  Container,
  Header,
  Heading,
  Left,
  LineColor,
  LineOption,
  RelatedLine,
  RelatedLineWrapper,
  Right,
  SelectorWrapper,
  StationOption,
} from './home.style'

import { useTranslation } from 'next-i18next'
import Result from './train/result'

const Home = () => {
  const dispatch = useDispatch()
  const { line: selectedLine, station: selectedStation } =
    useSelector(getTrainState)
  const { i18n, t } = useTranslation()
  const rightListRef = useRef(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [showRelated, setShowRelated] = useState(false)
  const refs = DATA.reduce((stationRef, value) => {
    for (const station of value.stations) {
      stationRef[station.code] = React.createRef()
    }
    return stationRef
  }, {})

  const onChangeLine = useCallback(
    (line: ILine) => {
      if (line.code === selectedLine?.code) return
      dispatch(setLine(line))
      dispatch(setStation(null))
      rightListRef?.current?.scrollTo({ top: 0 })
    },
    [selectedLine, dispatch]
  )
  const filterStations = useCallback((): ILineStation => {
    if (!selectedLine?.code) return null
    return DATA.find((s) => s.line.code === selectedLine.code)
  }, [selectedLine])

  const calcDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number, unit: string) => {
      const radLat1 = (Math.PI * lat1) / 180
      const radLat2 = (Math.PI * lat2) / 180
      const theta = lon1 - lon2
      const radTheta = (Math.PI * theta) / 180
      let dist =
        Math.sin(radLat1) * Math.sin(radLat2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta)
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
    },
    []
  )

  const findNearestStation = useCallback(
    (lat: number, lng: number) => {
      if (!lat || !lng) return
      let closestStation = null
      let closestLine = null
      let closestDistance = null

      for (const lineStation of DATA) {
        for (const station of lineStation.stations) {
          const distance = calcDistance(
            lat,
            lng,
            station.location.lat,
            station.location.lng,
            undefined
          )
          if (!closestStation || distance < closestDistance) {
            closestDistance = distance
            closestLine = lineStation.line
            closestStation = station
          }
        }
      }
      dispatch(setLine(closestLine))
      dispatch(setStation(closestStation))
      setGettingLocation(true)
    },
    [calcDistance, dispatch]
  )

  const getPositionSuccess = useCallback(
    (pos: { coords: { latitude: number; longitude: number } }) => {
      const crd = pos.coords
      findNearestStation(crd.latitude, crd.longitude)
    },
    [findNearestStation]
  )

  const getPositionError = useCallback((err: GeolocationPositionError) => {
    console.warn(`ERROR(${err.code}): ${err.message}`)
  }, [])

  const getCurrLocation = useCallback(() => {
    const options = {
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
    if (!selectedStation?.code) return
    refs[selectedStation.code]?.current?.scrollIntoView({
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

  useEffect(() => {
    if (selectedStation?.code) {
      scrollToStation()
    }
  }, [selectedLine, selectedStation, scrollToStation])

  const showMoreOptions = useCallback(() => {
    setShowRelated(true)
  }, [])

  const switchLine = useCallback(
    (lineCode: string, stationCode?: string) => {
      const lineData = DATA.find((s) => s.line.code === lineCode)
      const line = lineData?.line
      if (line) {
        dispatch(setLine(line))
        if (stationCode) {
          const station = lineData?.stations?.find(
            (sta) => sta.code === stationCode
          )
          dispatch(setStation(station))
        }
      }
      setShowRelated(false)
    },
    [dispatch]
  )

  const onCloseAlert = useCallback(() => {
    setShowRelated(false)
  }, [])

  return (
    <Container>
      <Header>
        <Heading>MTR Next Train</Heading>
        <CurrLocation onClick={getCurrLocation} />
      </Header>
      <SelectorWrapper>
        <Left>
          {DATA.map((l) => (
            <LineOption
              key={l.line.code}
              onClick={() => onChangeLine(l.line)}
              selected={l.line.code === selectedLine?.code}
              color={l.line.color}
            >
              <LineColor color={l.line.color} />
              <div className="option-name">{l.line.label[i18n.language]}</div>
            </LineOption>
          ))}
        </Left>
        <Right ref={rightListRef} bgColor={filterStations()?.line?.color}>
          {filterStations()?.stations?.map((s) => {
            return (
              <StationOption
                ref={refs[s.code]}
                key={s.code}
                onClick={() => dispatch(setStation(s))}
                selected={s.code === selectedStation?.code}
              >
                <div className="option-name station">
                  {s.label[i18n.language]}
                  {!_.isEmpty(s.related) && (
                    <div className="more-option" onClick={showMoreOptions}>
                      {'>'}
                    </div>
                  )}
                </div>
              </StationOption>
            )
          })}
        </Right>
      </SelectorWrapper>
      <Result line={selectedLine?.code} sta={selectedStation?.code} />
      {showRelated && selectedStation && (
        <Alert onPressClose={onCloseAlert}>
          <RelatedLineWrapper>
            {selectedStation.related?.map((rStation) => (
              <RelatedLine
                key={rStation.lineCode}
                lineColor={rStation.color}
                onClick={() =>
                  switchLine(rStation.lineCode, rStation.stationCode)
                }
              >
                {t(rStation.lineCode)}
              </RelatedLine>
            ))}
          </RelatedLineWrapper>
        </Alert>
      )}
    </Container>
  )
}
export default React.memo(Home)
