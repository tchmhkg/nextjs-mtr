'use client'

import { useLocalStorage } from '@hooks/useLocalStorage'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'

export const FONT_SIZE_SCALES = ['sm', 'md', 'lg', 'xl'] as const
export type FontSizeScale = (typeof FONT_SIZE_SCALES)[number]

const FONT_SIZE_PX: Record<FontSizeScale, string> = {
  sm: '16px',
  md: '18px',
  lg: '20px',
  xl: '22px',
}

interface FontSizeContextType {
  scale: FontSizeScale
  setScale: (scale: FontSizeScale) => void
  increase: () => void
  decrease: () => void
  canIncrease: boolean
  canDecrease: boolean
}

const FontSizeContext = createContext<FontSizeContextType>({
  scale: 'md',
  setScale: () => {},
  increase: () => {},
  decrease: () => {},
  canIncrease: true,
  canDecrease: true,
})

export const useFontSize = () => useContext(FontSizeContext)

function isFontSizeScale(value: unknown): value is FontSizeScale {
  return (
    typeof value === 'string' &&
    (FONT_SIZE_SCALES as readonly string[]).includes(value)
  )
}

export default function FontSizeProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [stored, setStored] = useLocalStorage<FontSizeScale>(
    'fontSizeScale',
    'md'
  )
  const scale = isFontSizeScale(stored) ? stored : 'md'

  const setScale = useCallback(
    (next: FontSizeScale) => {
      setStored(next)
    },
    [setStored]
  )

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_PX[scale]
  }, [scale])

  const index = FONT_SIZE_SCALES.indexOf(scale)
  const canDecrease = index > 0
  const canIncrease = index < FONT_SIZE_SCALES.length - 1

  const decrease = useCallback(() => {
    if (!canDecrease) return
    setScale(FONT_SIZE_SCALES[index - 1])
  }, [canDecrease, index, setScale])

  const increase = useCallback(() => {
    if (!canIncrease) return
    setScale(FONT_SIZE_SCALES[index + 1])
  }, [canIncrease, index, setScale])

  const value = useMemo(
    () => ({
      scale,
      setScale,
      increase,
      decrease,
      canIncrease,
      canDecrease,
    }),
    [scale, setScale, increase, decrease, canIncrease, canDecrease]
  )

  return (
    <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>
  )
}
