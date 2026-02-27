import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = globalThis.localStorage?.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      globalThis.localStorage?.setItem(key, JSON.stringify(valueToStore))
    } catch {
      // Silently ignore localStorage errors (SSR, disabled localStorage, quota exceeded)
    }
  }

  return [storedValue, setValue]
}
