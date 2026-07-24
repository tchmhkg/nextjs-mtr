import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import type { ILine, IStation } from '@utils/next-train-data'

export type { ILine, IStation, IRelatedLine } from '@utils/next-train-data'

export interface TrainState {
  line: ILine | null
  station: IStation | null
}

/**
 * Default state object with initial values.
 */
const initialState: TrainState = {
  line: null,
  station: null,
}

/**
 * Create a slice as a reducer containing actions.
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
