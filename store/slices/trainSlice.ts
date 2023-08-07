import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'

export interface IRelatedLine {
  lineCode: string
  color: string
  stationCode?: string
}

export interface ILine {
  code: string
  label: { en: string; tc: string }
  color: string
}

export interface IStation {
  code: string
  label: { en: string; tc: string }
  location: { lat: number; lng: number }
  related?: IRelatedLine[]
}
export interface TrainState {
  line: ILine
  station: IStation
}

/**
 * Default state object with initial values.
 */
const initialState: TrainState = {
  line: null,
  station: null,
} as const

/**
 * Create a slice as a reducer containing actions.
 *
 * In this example actions are included in the slice. It is fine and can be
 * changed based on your needs.
 */
export const trainSlice = createSlice({
  name: 'train',
  initialState,
  reducers: {
    setLine: (
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.line>
    ) => {
      state.line = action.payload
    },
    setStation: (
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.station>
    ) => {
      state.station = action.payload
    },
  },
})

// A small helper of train state for `useSelector` function.
export const getTrainState = (state: { train: TrainState }) => state.train

// Exports all actions
export const { setLine, setStation } = trainSlice.actions

export default trainSlice.reducer
