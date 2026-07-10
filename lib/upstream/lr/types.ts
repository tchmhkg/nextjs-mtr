/** Placeholder types for future Light Rail integration. */

export interface LrScheduleRequest {
  line: string
  sta: string
  lang: string
}

// Raw LR response shape TBD — see docs/LR_Next_Train_API_Spec_v1.1.pdf
export type LrScheduleRaw = unknown
