export interface TrainRouteRow {
  seq: string
  dest: string
  plat: string
  time: string
  [key: string]: unknown
}

export interface NextTrainAlert {
  message: string
  url: string | null
}

export interface NextTrainDto {
  up: TrainRouteRow[] | null
  down: TrainRouteRow[] | null
  isDelayed: boolean
  lastUpdated: string | null
  alert: NextTrainAlert | null
}
