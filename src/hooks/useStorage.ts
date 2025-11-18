/**
 * Universal storage hook that works with or without GitHub Spark
 * Prefers Spark KV when available, falls back to localStorage
 */

import { useLocalStorage } from './useLocalStorage'

type SetValue<T> = T | ((prev: T) => T)

// Check if Spark is available
const hasSparkKV = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).spark !== 'undefined' &&
         typeof (window as any).spark.kv !== 'undefined'
}

/**
 * Universal storage hook
 * Uses Spark KV if available, otherwise localStorage
 * Provides seamless migration path
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: SetValue<T>) => Promise<void>] {
  // For now, always use localStorage for autonomy
  // In the future, this could be configurable
  return useLocalStorage(key, defaultValue)
}

/**
 * Export the original hooks for explicit usage if needed
 */
export { useLocalStorage } from './useLocalStorage'
