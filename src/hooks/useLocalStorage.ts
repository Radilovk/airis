/**
 * localStorage adapter to replace @github/spark/hooks useKV
 * Provides the same API interface but stores data in browser localStorage
 */

import { useState, useEffect, useCallback } from 'react'

type SetValue<T> = T | ((prev: T) => T)

/**
 * Hook that mimics the Spark useKV API but uses localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple matching useKV interface
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: SetValue<T>) => Promise<void>] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Update localStorage when state changes
  const setValue = useCallback(
    async (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        // Save state
        setStoredValue(valueToStore)
        
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

/**
 * Migrate data from Spark KV to localStorage
 * This function helps transition existing users
 */
export async function migrateFromSparkKV(keys: string[]): Promise<void> {
  // Only attempt migration if Spark is available
  if (typeof window !== 'undefined' && (window as any).spark?.kv) {
    console.log('🔄 Attempting to migrate data from Spark KV to localStorage...')
    
    for (const key of keys) {
      try {
        // Check if already migrated
        const existing = window.localStorage.getItem(key)
        if (existing) {
          console.log(`✓ Key "${key}" already exists in localStorage, skipping`)
          continue
        }

        // Try to get from Spark KV
        const sparkValue = await (window as any).spark.kv.get(key)
        if (sparkValue !== null && sparkValue !== undefined) {
          window.localStorage.setItem(key, JSON.stringify(sparkValue))
          console.log(`✓ Migrated "${key}" from Spark KV to localStorage`)
        }
      } catch (error) {
        console.warn(`Could not migrate key "${key}":`, error)
      }
    }
    
    console.log('✅ Migration complete')
  }
}
