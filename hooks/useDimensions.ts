import { useLayoutEffect, useState } from 'react'

export const useDimensions = (ref: React.RefObject<HTMLElement | null>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setDimensions({ width: el.offsetWidth, height: el.offsetHeight })
  }, [ref])

  return dimensions
}
