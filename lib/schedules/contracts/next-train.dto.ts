export type EalTimeType = 'A' | 'D'

export interface TrainRouteRow {
  seq: string
  dest: string
  /** Display label when dest is not an i18n MessageKey (e.g. Light Rail). */
  destLabel?: string
  plat: string
  time: string
  /** EAL: Arrival or Departure (omit when absent). */
  timeType?: EalTimeType
  /** EAL via Racecourse, or LR route_no (omit when absent). */
  route?: string
  /** Relative ETA (LR); skip wall-clock duration when true. */
  relativeEta?: boolean
  trainLength?: number
}

export interface NextTrainAlert {
  message: string
  url: string | null
}

export interface NextTrainPlatform {
  id: string
  trains: TrainRouteRow[]
  /** Light Rail: platform service has ended for today. */
  endService?: boolean
}

export interface NextTrainDto {
  up: TrainRouteRow[] | null
  down: TrainRouteRow[] | null
  /** Light Rail: trains grouped by platform. */
  platforms?: NextTrainPlatform[] | null
  /** Light Rail: deduped route remarks for the station. */
  remarks?: string[] | null
  isDelayed: boolean
  lastUpdated: string | null
  alert: NextTrainAlert | null
}
