/**
 * Multi-Layer Storage System
 * Provides fallback storage mechanisms for data persistence
 */

type StorageLayer = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'

interface StorageOptions {
  preferredLayer?: StorageLayer
  fallbackLayers?: StorageLayer[]
  ttl?: number // Time to live in milliseconds
}

interface StoredItem<T> {
  value: T
  timestamp: number
  ttl?: number
}

class MultiLayerStorage {
  private memoryCache: Map<string, any> = new Map()
  private readonly defaultOptions: StorageOptions = {
    preferredLayer: 'localStorage',
    fallbackLayers: ['sessionStorage', 'memory'],
    ttl: undefined
  }

  /**
   * Check if a storage layer is available
   */
  private isLayerAvailable(layer: StorageLayer): boolean {
    try {
      switch (layer) {
        case 'localStorage':
          if (typeof window === 'undefined' || !window.localStorage) return false
          const testKey = '__storage_test__'
          window.localStorage.setItem(testKey, 'test')
          window.localStorage.removeItem(testKey)
          return true
        
        case 'sessionStorage':
          if (typeof window === 'undefined' || !window.sessionStorage) return false
          const testKey2 = '__storage_test__'
          window.sessionStorage.setItem(testKey2, 'test')
          window.sessionStorage.removeItem(testKey2)
          return true
        
        case 'memory':
          return true
        
        case 'indexedDB':
          return typeof window !== 'undefined' && 'indexedDB' in window
        
        default:
          return false
      }
    } catch (e) {
      return false
    }
  }

  /**
   * Get available storage layer
   */
  private getAvailableLayer(options: StorageOptions): StorageLayer {
    const layers = [
      options.preferredLayer,
      ...(options.fallbackLayers || this.defaultOptions.fallbackLayers || [])
    ].filter(Boolean) as StorageLayer[]

    for (const layer of layers) {
      if (this.isLayerAvailable(layer)) {
        return layer
      }
    }

    return 'memory' // Always available fallback
  }

  /**
   * Set item in storage
   */
  async setItem<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    const opts = { ...this.defaultOptions, ...options }
    const layer = this.getAvailableLayer(opts)
    
    const item: StoredItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: opts.ttl
    }

    try {
      switch (layer) {
        case 'localStorage':
          window.localStorage.setItem(key, JSON.stringify(item))
          break
        
        case 'sessionStorage':
          window.sessionStorage.setItem(key, JSON.stringify(item))
          break
        
        case 'memory':
          this.memoryCache.set(key, item)
          break
        
        case 'indexedDB':
          // IndexedDB implementation would go here
          // For now, fallback to memory
          this.memoryCache.set(key, item)
          break
      }
    } catch (e) {
      console.error(`Failed to set item in ${layer}:`, e)
      // Try fallback
      if (layer !== 'memory') {
        this.memoryCache.set(key, item)
      }
    }
  }

  /**
   * Get item from storage
   */
  async getItem<T>(key: string, options: StorageOptions = {}): Promise<T | null> {
    const opts = { ...this.defaultOptions, ...options }
    const layer = this.getAvailableLayer(opts)

    try {
      let item: StoredItem<T> | null = null

      switch (layer) {
        case 'localStorage':
          const localData = window.localStorage.getItem(key)
          if (localData) item = JSON.parse(localData)
          break
        
        case 'sessionStorage':
          const sessionData = window.sessionStorage.getItem(key)
          if (sessionData) item = JSON.parse(sessionData)
          break
        
        case 'memory':
          item = this.memoryCache.get(key) || null
          break
        
        case 'indexedDB':
          // IndexedDB implementation would go here
          item = this.memoryCache.get(key) || null
          break
      }

      if (!item) return null

      // Check TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        await this.removeItem(key, options)
        return null
      }

      return item.value
    } catch (e) {
      console.error(`Failed to get item from ${layer}:`, e)
      // Try memory fallback
      if (layer !== 'memory') {
        const item = this.memoryCache.get(key)
        return item ? item.value : null
      }
      return null
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string, options: StorageOptions = {}): Promise<void> {
    const opts = { ...this.defaultOptions, ...options }
    const layer = this.getAvailableLayer(opts)

    try {
      switch (layer) {
        case 'localStorage':
          window.localStorage.removeItem(key)
          break
        
        case 'sessionStorage':
          window.sessionStorage.removeItem(key)
          break
        
        case 'memory':
          this.memoryCache.delete(key)
          break
        
        case 'indexedDB':
          this.memoryCache.delete(key)
          break
      }
    } catch (e) {
      console.error(`Failed to remove item from ${layer}:`, e)
    }
  }

  /**
   * Clear all storage
   */
  async clear(options: StorageOptions = {}): Promise<void> {
    const opts = { ...this.defaultOptions, ...options }
    const layer = this.getAvailableLayer(opts)

    try {
      switch (layer) {
        case 'localStorage':
          window.localStorage.clear()
          break
        
        case 'sessionStorage':
          window.sessionStorage.clear()
          break
        
        case 'memory':
          this.memoryCache.clear()
          break
        
        case 'indexedDB':
          this.memoryCache.clear()
          break
      }
    } catch (e) {
      console.error(`Failed to clear ${layer}:`, e)
    }
  }

  /**
   * Get all keys from storage
   */
  async keys(options: StorageOptions = {}): Promise<string[]> {
    const opts = { ...this.defaultOptions, ...options }
    const layer = this.getAvailableLayer(opts)

    try {
      switch (layer) {
        case 'localStorage':
          return Object.keys(window.localStorage)
        
        case 'sessionStorage':
          return Object.keys(window.sessionStorage)
        
        case 'memory':
          return Array.from(this.memoryCache.keys())
        
        case 'indexedDB':
          return Array.from(this.memoryCache.keys())
        
        default:
          return []
      }
    } catch (e) {
      console.error(`Failed to get keys from ${layer}:`, e)
      return []
    }
  }

  /**
   * Get storage size estimate
   */
  async getSize(options: StorageOptions = {}): Promise<number> {
    const opts = { ...this.defaultOptions, ...options }
    const layer = this.getAvailableLayer(opts)
    
    try {
      switch (layer) {
        case 'localStorage':
        case 'sessionStorage': {
          const storage = layer === 'localStorage' ? window.localStorage : window.sessionStorage
          let size = 0
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i)
            if (key) {
              const value = storage.getItem(key)
              if (value) {
                size += key.length + value.length
              }
            }
          }
          return size
        }
        
        case 'memory': {
          let size = 0
          this.memoryCache.forEach((value, key) => {
            size += key.length + JSON.stringify(value).length
          })
          return size
        }
        
        default:
          return 0
      }
    } catch (e) {
      console.error(`Failed to get size from ${layer}:`, e)
      return 0
    }
  }
}

// Export singleton instance
export const multiLayerStorage = new MultiLayerStorage()

// Export class for custom instances
export { MultiLayerStorage }
