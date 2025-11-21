/**
 * Error Logger
 * Centralized error tracking and logging system
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorCategory = 'network' | 'storage' | 'ai' | 'ui' | 'validation' | 'system' | 'unknown'

export interface ErrorLog {
  id: string
  timestamp: string
  message: string
  stack?: string
  severity: ErrorSeverity
  category: ErrorCategory
  context?: Record<string, any>
  userAgent?: string
  url?: string
}

export interface ErrorLoggerOptions {
  maxLogs?: number
  persistToStorage?: boolean
  consoleOutput?: boolean
  severity?: ErrorSeverity
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private readonly maxLogs: number
  private readonly persistToStorage: boolean
  private readonly consoleOutput: boolean
  private readonly storageKey = 'error-logs'

  constructor(options: ErrorLoggerOptions = {}) {
    this.maxLogs = options.maxLogs || 100
    this.persistToStorage = options.persistToStorage !== false
    this.consoleOutput = options.consoleOutput !== false

    // Load existing logs from storage
    if (this.persistToStorage) {
      this.loadLogs()
    }

    // Set up global error handler
    this.setupGlobalErrorHandler()
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandler() {
    if (typeof window !== 'undefined') {
      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        this.logError({
          message: event.message,
          stack: event.error?.stack,
          severity: 'high',
          category: 'system',
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        })
      })

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          severity: 'high',
          category: 'system',
          context: {
            reason: event.reason
          }
        })
      })
    }
  }

  /**
   * Log an error
   */
  logError(error: {
    message: string
    stack?: string
    severity: ErrorSeverity
    category: ErrorCategory
    context?: Record<string, any>
  }): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      severity: error.severity,
      category: error.category,
      context: error.context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // Add to logs array
    this.logs.unshift(errorLog)

    // Trim if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Persist to storage
    if (this.persistToStorage) {
      this.saveLogs()
    }

    // Console output
    if (this.consoleOutput) {
      this.logToConsole(errorLog)
    }

    return errorLog.id
  }

  /**
   * Log to console with appropriate level
   */
  private logToConsole(errorLog: ErrorLog) {
    const prefix = `[${errorLog.category.toUpperCase()}] [${errorLog.severity.toUpperCase()}]`
    
    switch (errorLog.severity) {
      case 'critical':
      case 'high':
        console.error(prefix, errorLog.message, errorLog)
        break
      case 'medium':
        console.warn(prefix, errorLog.message, errorLog)
        break
      case 'low':
        console.log(prefix, errorLog.message, errorLog)
        break
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Load logs from storage
   */
  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load error logs from storage:', e)
    }
  }

  /**
   * Save logs to storage
   */
  private saveLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs))
    } catch (e) {
      console.error('Failed to save error logs to storage:', e)
    }
  }

  /**
   * Get all logs
   */
  getLogs(filters?: {
    severity?: ErrorSeverity
    category?: ErrorCategory
    limit?: number
  }): ErrorLog[] {
    let filtered = [...this.logs]

    if (filters?.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity)
    }

    if (filters?.category) {
      filtered = filtered.filter(log => log.category === filters.category)
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  /**
   * Get log by ID
   */
  getLogById(id: string): ErrorLog | undefined {
    return this.logs.find(log => log.id === id)
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = []
    if (this.persistToStorage) {
      try {
        localStorage.removeItem(this.storageKey)
      } catch (e) {
        console.error('Failed to clear error logs from storage:', e)
      }
    }
  }

  /**
   * Clear logs older than specified days
   */
  clearOldLogs(days: number) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffTime = cutoffDate.getTime()

    this.logs = this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime()
      return logTime > cutoffTime
    })

    if (this.persistToStorage) {
      this.saveLogs()
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number
    bySeverity: Record<ErrorSeverity, number>
    byCategory: Record<ErrorCategory, number>
    last24Hours: number
  } {
    const stats = {
      total: this.logs.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byCategory: {
        network: 0,
        storage: 0,
        ai: 0,
        ui: 0,
        validation: 0,
        system: 0,
        unknown: 0
      },
      last24Hours: 0
    }

    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)

    for (const log of this.logs) {
      stats.bySeverity[log.severity]++
      stats.byCategory[log.category]++
      
      const logTime = new Date(log.timestamp).getTime()
      if (logTime > oneDayAgo) {
        stats.last24Hours++
      }
    }

    return stats
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()

// Export convenience functions
export function logError(
  message: string,
  options: {
    severity?: ErrorSeverity
    category?: ErrorCategory
    context?: Record<string, any>
    error?: Error
  } = {}
): string {
  return errorLogger.logError({
    message,
    stack: options.error?.stack,
    severity: options.severity || 'medium',
    category: options.category || 'unknown',
    context: options.context
  })
}

export function logNetworkError(message: string, context?: Record<string, any>): string {
  return logError(message, { severity: 'medium', category: 'network', context })
}

export function logStorageError(message: string, context?: Record<string, any>): string {
  return logError(message, { severity: 'medium', category: 'storage', context })
}

export function logAIError(message: string, context?: Record<string, any>): string {
  return logError(message, { severity: 'high', category: 'ai', context })
}

export function logUIError(message: string, context?: Record<string, any>): string {
  return logError(message, { severity: 'low', category: 'ui', context })
}

export function logValidationError(message: string, context?: Record<string, any>): string {
  return logError(message, { severity: 'low', category: 'validation', context })
}

// Export class for custom instances
export { ErrorLogger }
