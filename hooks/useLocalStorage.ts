import { useCallback, useSyncExternalStore } from 'react'

/** Same-tab `localStorage` updates do not fire `storage`; we broadcast manually. */
const LOCAL_STORAGE_CHANGED = 'local-storage-changed'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (globalThis.window === undefined) return () => {}
      const win = globalThis.window
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onStoreChange()
      }
      const onCustom = () => onStoreChange()
      win.addEventListener('storage', onStorage)
      win.addEventListener(LOCAL_STORAGE_CHANGED, onCustom)
      return () => {
        win.removeEventListener('storage', onStorage)
        win.removeEventListener(LOCAL_STORAGE_CHANGED, onCustom)
      }
    },
    [key]
  )

  const getSnapshot = useCallback((): T => {
    try {
      const item = globalThis.localStorage?.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  }, [key, initialValue])

  const getServerSnapshot = useCallback((): T => initialValue, [initialValue])

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const current = getSnapshot()
        const next =
          typeof value === 'function' ? (value as (prev: T) => T)(current) : value
        globalThis.localStorage?.setItem(key, JSON.stringify(next))
        globalThis.window?.dispatchEvent(new Event(LOCAL_STORAGE_CHANGED))
      } catch {
        // Silently ignore localStorage errors (SSR, disabled localStorage, quota exceeded)
      }
    },
    [key, getSnapshot]
  )

  return [storedValue, setValue]
}
