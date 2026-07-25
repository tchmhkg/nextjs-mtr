/** Light Rail upstream request/response types (API Spec v1.1). */

export type LrScheduleRequest = {
  stationId: string
  withSpecial?: boolean
  fresh?: boolean
}

export type LrRouteRow = {
  train_length?: number
  arrival_departure?: string
  dest_en?: string
  dest_ch?: string
  time_en?: string
  time_ch?: string
  route_no?: string
  stop?: number
  special?: number
  additionalInfo1?: string | null
  routeRemarkEng2?: string | null
  routeRemarkChi2?: string | null
}

export type LrPlatform = {
  platform_id: number
  route_list?: LrRouteRow[]
}

export type LrScheduleResponse = {
  status: number
  system_time?: string
  platform_list?: LrPlatform[]
}
