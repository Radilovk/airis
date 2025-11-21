/**
 * Storage Cleanup Utilities
 * Manages storage cleanup and memory optimization
 */

export interface CleanupResult {
  itemsRemoved: number
  bytesFreed: number
  errors: string[]
}

export interface CleanupOptions {
  olderThanDays?: number
  removeReports?: boolean
  removeImages?: boolean
  removeCache?: boolean
  keepLatestN?: number
  dryRun?: boolean
}

/**
 * Get item size in bytes
 */
function getItemSize(key: string, value: string): number {
  return key.length + value.length
}

/**
 * Parse stored item timestamp
 */
function getItemTimestamp(value: string): number | null {
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object') {
      // Check for common timestamp fields
      if (parsed.timestamp) return new Date(parsed.timestamp).getTime()
      if (parsed.createdAt) return new Date(parsed.createdAt).getTime()
      if (parsed.uploadDate) return new Date(parsed.uploadDate).getTime()
    }
    return null
  } catch {
    return null
  }
}

/**
 * Check if item should be removed based on age
 */
function isExpired(timestamp: number | null, maxAgeDays: number): boolean {
  if (!timestamp) return false
  const ageMs = Date.now() - timestamp
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  return ageDays > maxAgeDays
}

/**
 * Clean old reports
 */
function cleanOldReports(options: CleanupOptions): CleanupResult {
  const result: CleanupResult = {
    itemsRemoved: 0,
    bytesFreed: 0,
    errors: []
  }

  try {
    const reportsKey = 'analysis-reports'
    const reportsData = localStorage.getItem(reportsKey)
    
    if (!reportsData) return result

    const reports = JSON.parse(reportsData)
    
    if (!Array.isArray(reports)) return result

    const maxAgeDays = options.olderThanDays || 30
    const keepLatestN = options.keepLatestN || 5

    // Sort by timestamp (newest first)
    const sortedReports = reports.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    })

    // Keep latest N reports
    const reportsToKeep = sortedReports.slice(0, keepLatestN)

    // Filter older reports
    const filteredReports = reportsToKeep.filter(report => {
      const timestamp = new Date(report.timestamp).getTime()
      return !isExpired(timestamp, maxAgeDays)
    })

    const removed = reports.length - filteredReports.length
    
    if (removed > 0 && !options.dryRun) {
      const oldSize = getItemSize(reportsKey, reportsData)
      const newData = JSON.stringify(filteredReports)
      localStorage.setItem(reportsKey, newData)
      const newSize = getItemSize(reportsKey, newData)
      
      result.itemsRemoved = removed
      result.bytesFreed = oldSize - newSize
    } else if (removed > 0) {
      result.itemsRemoved = removed
      result.bytesFreed = reportsData.length - JSON.stringify(filteredReports).length
    }
  } catch (e) {
    result.errors.push(`Failed to clean reports: ${e}`)
  }

  return result
}

/**
 * Clean old cached images
 */
function cleanOldImages(options: CleanupOptions): CleanupResult {
  const result: CleanupResult = {
    itemsRemoved: 0,
    bytesFreed: 0,
    errors: []
  }

  try {
    const maxAgeDays = options.olderThanDays || 7
    const imageKeys: string[] = []

    // Find all image-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('iris-image-') || key.includes('-image-cache'))) {
        imageKeys.push(key)
      }
    }

    for (const key of imageKeys) {
      try {
        const value = localStorage.getItem(key)
        if (!value) continue

        const timestamp = getItemTimestamp(value)
        
        if (timestamp && isExpired(timestamp, maxAgeDays)) {
          const size = getItemSize(key, value)
          
          if (!options.dryRun) {
            localStorage.removeItem(key)
          }
          
          result.itemsRemoved++
          result.bytesFreed += size
        }
      } catch (e) {
        result.errors.push(`Failed to process image key ${key}: ${e}`)
      }
    }
  } catch (e) {
    result.errors.push(`Failed to clean images: ${e}`)
  }

  return result
}

/**
 * Clean cache entries
 */
function cleanCache(options: CleanupOptions): CleanupResult {
  const result: CleanupResult = {
    itemsRemoved: 0,
    bytesFreed: 0,
    errors: []
  }

  try {
    const cacheKeys: string[] = []

    // Find all cache-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('-cache') || key.includes('temp-') || key.startsWith('cache-'))) {
        cacheKeys.push(key)
      }
    }

    for (const key of cacheKeys) {
      try {
        const value = localStorage.getItem(key)
        if (!value) continue

        const size = getItemSize(key, value)
        
        if (!options.dryRun) {
          localStorage.removeItem(key)
        }
        
        result.itemsRemoved++
        result.bytesFreed += size
      } catch (e) {
        result.errors.push(`Failed to process cache key ${key}: ${e}`)
      }
    }
  } catch (e) {
    result.errors.push(`Failed to clean cache: ${e}`)
  }

  return result
}

/**
 * Main cleanup function
 */
export async function cleanupStorage(options: CleanupOptions = {}): Promise<CleanupResult> {
  const totalResult: CleanupResult = {
    itemsRemoved: 0,
    bytesFreed: 0,
    errors: []
  }

  // Clean reports if enabled
  if (options.removeReports !== false) {
    const reportResult = cleanOldReports(options)
    totalResult.itemsRemoved += reportResult.itemsRemoved
    totalResult.bytesFreed += reportResult.bytesFreed
    totalResult.errors.push(...reportResult.errors)
  }

  // Clean images if enabled
  if (options.removeImages) {
    const imageResult = cleanOldImages(options)
    totalResult.itemsRemoved += imageResult.itemsRemoved
    totalResult.bytesFreed += imageResult.bytesFreed
    totalResult.errors.push(...imageResult.errors)
  }

  // Clean cache if enabled
  if (options.removeCache) {
    const cacheResult = cleanCache(options)
    totalResult.itemsRemoved += cacheResult.itemsRemoved
    totalResult.bytesFreed += cacheResult.bytesFreed
    totalResult.errors.push(...cacheResult.errors)
  }

  return totalResult
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  totalSize: number
  itemCount: number
  largestItems: Array<{ key: string; size: number }>
} {
  let totalSize = 0
  const items: Array<{ key: string; size: number }> = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      if (value) {
        const size = getItemSize(key, value)
        totalSize += size
        items.push({ key, size })
      }
    }
  }

  // Sort by size (largest first)
  items.sort((a, b) => b.size - a.size)

  return {
    totalSize,
    itemCount: localStorage.length,
    largestItems: items.slice(0, 10)
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

/**
 * Schedule automatic cleanup
 */
export function scheduleAutoCleanup(options: CleanupOptions = {}, intervalHours: number = 24): () => void {
  const intervalMs = intervalHours * 60 * 60 * 1000

  const cleanup = async () => {
    console.log('Running scheduled storage cleanup...')
    const result = await cleanupStorage(options)
    console.log(`Cleanup complete: ${result.itemsRemoved} items removed, ${formatBytes(result.bytesFreed)} freed`)
    
    if (result.errors.length > 0) {
      console.warn('Cleanup errors:', result.errors)
    }
  }

  // Run immediately
  cleanup()

  // Schedule recurring cleanup
  const intervalId = setInterval(cleanup, intervalMs)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}
