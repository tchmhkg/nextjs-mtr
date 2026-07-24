'use client'

import type { MessageKey } from '@i18n/message-key'
import type { ILine, IStation } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { calcDistanceKm } from '@utils/geo'
import { useCallback, useState } from 'react'

export function useNearestStation(
  onFound: (line: ILine, station: IStation) => void
) {
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<MessageKey | null>(null)

  const findNearest = useCallback(
    (lat: number, lng: number) => {
      let closestStation: IStation | null = null
      let closestLine: ILine | null = null
      let closestDistance: number | null = null

      for (const lineStation of DATA) {
        for (const station of lineStation.stations) {
          const distance = calcDistanceKm(
            lat,
            lng,
            station.location.lat,
            station.location.lng
          )
          if (
            !closestStation ||
            closestDistance === null ||
            distance < closestDistance
          ) {
            closestDistance = distance
            closestLine = lineStation.line
            closestStation = station
          }
        }
      }
      if (closestLine && closestStation) {
        onFound(closestLine, closestStation)
      }
    },
    [onFound]
  )

  const getCurrLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location unavailable')
      return
    }
    setLocationError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        findNearest(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied'
            : 'Location unavailable'
        )
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    )
  }, [findNearest])

  return { locating, locationError, getCurrLocation, setLocationError }
}
