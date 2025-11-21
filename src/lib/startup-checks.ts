/**
 * Startup Checks
 * Validates system initialization and configuration
 */

export interface StartupCheckResult {
  name: string
  passed: boolean
  message: string
  critical: boolean
}

export interface StartupReport {
  allPassed: boolean
  criticalFailed: boolean
  checks: StartupCheckResult[]
  timestamp: string
}

/**
 * Check if browser storage is available
 */
function checkStorageAvailable(): StartupCheckResult {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return {
      name: 'Storage Available',
      passed: true,
      message: 'localStorage is available and working',
      critical: true
    }
  } catch (e) {
    return {
      name: 'Storage Available',
      passed: false,
      message: 'localStorage is not available or disabled',
      critical: true
    }
  }
}

/**
 * Check if required APIs are available
 */
function checkRequiredAPIs(): StartupCheckResult {
  const required = ['fetch', 'Promise', 'localStorage', 'JSON']
  const missing = required.filter(api => !(api in window))
  
  if (missing.length === 0) {
    return {
      name: 'Required APIs',
      passed: true,
      message: 'All required browser APIs are available',
      critical: true
    }
  }
  
  return {
    name: 'Required APIs',
    passed: false,
    message: `Missing required APIs: ${missing.join(', ')}`,
    critical: true
  }
}

/**
 * Check if AI configuration exists
 */
function checkAIConfiguration(): StartupCheckResult {
  try {
    const config = localStorage.getItem('ai-model-config')
    
    if (!config) {
      return {
        name: 'AI Configuration',
        passed: false,
        message: 'AI model configuration not found. Please configure in Admin panel.',
        critical: false
      }
    }
    
    const parsed = JSON.parse(config)
    
    if (!parsed.provider || !parsed.model) {
      return {
        name: 'AI Configuration',
        passed: false,
        message: 'AI configuration is incomplete',
        critical: false
      }
    }
    
    return {
      name: 'AI Configuration',
      passed: true,
      message: `AI configured: ${parsed.provider} / ${parsed.model}`,
      critical: false
    }
  } catch (e) {
    return {
      name: 'AI Configuration',
      passed: false,
      message: 'Failed to read AI configuration',
      critical: false
    }
  }
}

/**
 * Check storage quota
 */
async function checkStorageQuota(): Promise<StartupCheckResult> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0
      
      if (percentUsed > 90) {
        return {
          name: 'Storage Quota',
          passed: false,
          message: `Storage is ${percentUsed.toFixed(1)}% full. Consider clearing old data.`,
          critical: false
        }
      }
      
      return {
        name: 'Storage Quota',
        passed: true,
        message: `Storage usage: ${(usage / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB (${percentUsed.toFixed(1)}%)`,
        critical: false
      }
    }
    
    return {
      name: 'Storage Quota',
      passed: true,
      message: 'Storage quota API not available',
      critical: false
    }
  } catch (e) {
    return {
      name: 'Storage Quota',
      passed: true,
      message: 'Could not check storage quota',
      critical: false
    }
  }
}

/**
 * Check if default data exists
 */
function checkDefaultData(): StartupCheckResult {
  try {
    const hasPrompt = localStorage.getItem('ai-prompt-template')
    const hasManual = localStorage.getItem('iridology-manual')
    
    if (!hasPrompt && !hasManual) {
      return {
        name: 'Default Data',
        passed: false,
        message: 'Default templates not initialized',
        critical: false
      }
    }
    
    return {
      name: 'Default Data',
      passed: true,
      message: 'Default templates are present',
      critical: false
    }
  } catch (e) {
    return {
      name: 'Default Data',
      passed: false,
      message: 'Failed to check default data',
      critical: false
    }
  }
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility(): StartupCheckResult {
  const requiredFeatures = {
    'ES6 Classes': typeof class {} === 'function',
    'Arrow Functions': (() => true)(),
    'Template Literals': `test` === 'test',
    'Async/Await': async () => true,
    'Fetch API': 'fetch' in window,
    'Canvas API': 'HTMLCanvasElement' in window,
    'FileReader API': 'FileReader' in window
  }
  
  const unsupported = Object.entries(requiredFeatures)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature)
  
  if (unsupported.length === 0) {
    return {
      name: 'Browser Compatibility',
      passed: true,
      message: 'Browser supports all required features',
      critical: true
    }
  }
  
  return {
    name: 'Browser Compatibility',
    passed: false,
    message: `Unsupported features: ${unsupported.join(', ')}`,
    critical: true
  }
}

/**
 * Check network connectivity
 */
async function checkNetworkConnectivity(): Promise<StartupCheckResult> {
  try {
    if (!navigator.onLine) {
      return {
        name: 'Network Connectivity',
        passed: false,
        message: 'No internet connection detected',
        critical: false
      }
    }
    
    // Try to fetch a small resource to verify connectivity
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      return {
        name: 'Network Connectivity',
        passed: true,
        message: 'Internet connection is active',
        critical: false
      }
    } catch (e) {
      clearTimeout(timeoutId)
      return {
        name: 'Network Connectivity',
        passed: false,
        message: 'Network check timed out or failed',
        critical: false
      }
    }
  } catch (e) {
    return {
      name: 'Network Connectivity',
      passed: true,
      message: 'Could not check network connectivity',
      critical: false
    }
  }
}

/**
 * Run all startup checks
 */
export async function runStartupChecks(): Promise<StartupReport> {
  const checks: StartupCheckResult[] = []
  
  // Synchronous checks
  checks.push(checkStorageAvailable())
  checks.push(checkRequiredAPIs())
  checks.push(checkBrowserCompatibility())
  checks.push(checkAIConfiguration())
  checks.push(checkDefaultData())
  
  // Asynchronous checks
  checks.push(await checkStorageQuota())
  checks.push(await checkNetworkConnectivity())
  
  const allPassed = checks.every(check => check.passed)
  const criticalFailed = checks.some(check => check.critical && !check.passed)
  
  return {
    allPassed,
    criticalFailed,
    checks,
    timestamp: new Date().toISOString()
  }
}

/**
 * Format startup report as string
 */
export function formatStartupReport(report: StartupReport): string {
  let output = `Startup Checks - ${new Date(report.timestamp).toLocaleString()}\n`
  output += `Overall Status: ${report.allPassed ? '✓ PASSED' : '✗ FAILED'}\n`
  
  if (report.criticalFailed) {
    output += `⚠️  CRITICAL ISSUES DETECTED\n`
  }
  
  output += '\n'
  
  for (const check of report.checks) {
    const status = check.passed ? '✓' : '✗'
    const critical = check.critical ? ' [CRITICAL]' : ''
    output += `${status} ${check.name}${critical}\n`
    output += `  ${check.message}\n\n`
  }
  
  return output
}

/**
 * Log startup report to console
 */
export function logStartupReport(report: StartupReport): void {
  console.group('🚀 Startup Checks')
  
  for (const check of report.checks) {
    const style = check.passed 
      ? 'color: green; font-weight: bold'
      : check.critical
      ? 'color: red; font-weight: bold'
      : 'color: orange'
    
    console.log(`%c${check.passed ? '✓' : '✗'} ${check.name}`, style)
    console.log(`  ${check.message}`)
  }
  
  if (report.criticalFailed) {
    console.error('⚠️  Critical startup checks failed!')
  } else if (report.allPassed) {
    console.log('%c✓ All checks passed', 'color: green; font-weight: bold')
  } else {
    console.warn('⚠️  Some non-critical checks failed')
  }
  
  console.groupEnd()
}
