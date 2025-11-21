/**
 * Upload Diagnostics
 * File upload diagnostics and validation utilities
 */

export interface UploadDiagnosticResult {
  success: boolean
  errors: string[]
  warnings: string[]
  info: {
    fileName: string
    fileSize: number
    fileType: string
    dimensions?: { width: number; height: number }
    aspectRatio?: number
    isValid: boolean
  }
}

export interface UploadValidationOptions {
  maxSizeMB?: number
  allowedTypes?: string[]
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  requireSquare?: boolean
}

/**
 * Validate file basic properties
 */
function validateFileBasics(
  file: File,
  options: UploadValidationOptions
): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file size
  const maxSizeBytes = (options.maxSizeMB || 10) * 1024 * 1024
  if (file.size > maxSizeBytes) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed (${options.maxSizeMB || 10} MB)`)
  }

  // Check file type
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
  }

  // Check file name
  if (file.name.length > 255) {
    warnings.push('File name is very long and may cause issues')
  }

  return { errors, warnings }
}

/**
 * Validate image dimensions
 */
async function validateImageDimensions(
  file: File,
  options: UploadValidationOptions
): Promise<{
  errors: string[]
  warnings: string[]
  dimensions: { width: number; height: number }
  aspectRatio: number
}> {
  const errors: string[] = []
  const warnings: string[] = []

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const aspectRatio = width / height

      // Check minimum dimensions
      if (options.minWidth && width < options.minWidth) {
        errors.push(`Image width (${width}px) is below minimum required (${options.minWidth}px)`)
      }

      if (options.minHeight && height < options.minHeight) {
        errors.push(`Image height (${height}px) is below minimum required (${options.minHeight}px)`)
      }

      // Check maximum dimensions
      if (options.maxWidth && width > options.maxWidth) {
        warnings.push(`Image width (${width}px) exceeds recommended maximum (${options.maxWidth}px)`)
      }

      if (options.maxHeight && height > options.maxHeight) {
        warnings.push(`Image height (${height}px) exceeds recommended maximum (${options.maxHeight}px)`)
      }

      // Check if square is required
      if (options.requireSquare && Math.abs(aspectRatio - 1) > 0.05) {
        warnings.push(`Image is not square (aspect ratio: ${aspectRatio.toFixed(2)}:1)`)
      }

      // Check aspect ratio
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        warnings.push(`Unusual aspect ratio: ${aspectRatio.toFixed(2)}:1`)
      }

      URL.revokeObjectURL(url)
      resolve({ errors, warnings, dimensions: { width, height }, aspectRatio })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      errors.push('Failed to load image. File may be corrupted.')
      resolve({ errors, warnings, dimensions: { width: 0, height: 0 }, aspectRatio: 0 })
    }

    img.src = url
  })
}

/**
 * Check image quality and characteristics
 */
async function analyzeImageQuality(file: File): Promise<{
  warnings: string[]
  info: Record<string, any>
}> {
  const warnings: string[] = []
  const info: Record<string, any> = {}

  try {
    const dataUrl = await fileToDataUrl(file)
    
    // Check for very small file sizes which might indicate low quality
    const sizePerPixel = file.size / (1024 * 1024) // Rough estimate
    if (sizePerPixel < 0.01) {
      warnings.push('Image file size is very small, which may indicate low quality or heavy compression')
    }

    info.dataUrlLength = dataUrl.length
    info.compressionRatio = file.size / dataUrl.length

  } catch (e) {
    warnings.push('Failed to analyze image quality')
  }

  return { warnings, info }
}

/**
 * Convert file to data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Main diagnostic function
 */
export async function diagnoseUpload(
  file: File,
  options: UploadValidationOptions = {}
): Promise<UploadDiagnosticResult> {
  const result: UploadDiagnosticResult = {
    success: true,
    errors: [],
    warnings: [],
    info: {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isValid: false
    }
  }

  // Validate basic file properties
  const basicValidation = validateFileBasics(file, options)
  result.errors.push(...basicValidation.errors)
  result.warnings.push(...basicValidation.warnings)

  // If basic validation failed, return early
  if (result.errors.length > 0) {
    result.success = false
    return result
  }

  // Validate image dimensions (for image files)
  if (file.type.startsWith('image/')) {
    const dimensionValidation = await validateImageDimensions(file, options)
    result.errors.push(...dimensionValidation.errors)
    result.warnings.push(...dimensionValidation.warnings)
    result.info.dimensions = dimensionValidation.dimensions
    result.info.aspectRatio = dimensionValidation.aspectRatio

    // Analyze image quality
    const qualityAnalysis = await analyzeImageQuality(file)
    result.warnings.push(...qualityAnalysis.warnings)
    Object.assign(result.info, qualityAnalysis.info)
  }

  // Set final success status
  result.success = result.errors.length === 0
  result.info.isValid = result.success

  return result
}

/**
 * Format diagnostic result as string
 */
export function formatDiagnosticResult(result: UploadDiagnosticResult): string {
  let output = '=== Upload Diagnostic Report ===\n\n'
  
  output += 'File Information:\n'
  output += `  Name: ${result.info.fileName}\n`
  output += `  Size: ${(result.info.fileSize / 1024 / 1024).toFixed(2)} MB\n`
  output += `  Type: ${result.info.fileType}\n`
  
  if (result.info.dimensions) {
    output += `  Dimensions: ${result.info.dimensions.width}x${result.info.dimensions.height}px\n`
    output += `  Aspect Ratio: ${result.info.aspectRatio?.toFixed(2)}:1\n`
  }
  
  output += `\nValidation: ${result.success ? '✓ PASSED' : '✗ FAILED'}\n`
  
  if (result.errors.length > 0) {
    output += '\nErrors:\n'
    result.errors.forEach(error => {
      output += `  ✗ ${error}\n`
    })
  }
  
  if (result.warnings.length > 0) {
    output += '\nWarnings:\n'
    result.warnings.forEach(warning => {
      output += `  ⚠ ${warning}\n`
    })
  }
  
  if (result.errors.length === 0 && result.warnings.length === 0) {
    output += '\n✓ No issues detected\n'
  }
  
  return output
}

/**
 * Quick validation for iris images
 */
export async function validateIrisImage(file: File): Promise<UploadDiagnosticResult> {
  return diagnoseUpload(file, {
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth: 400,
    minHeight: 400,
    maxWidth: 4096,
    maxHeight: 4096
  })
}

/**
 * Get detailed file information
 */
export function getFileInfo(file: File): {
  name: string
  size: string
  type: string
  lastModified: string
} {
  return {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleString()
  }
}

/**
 * Check browser support for file operations
 */
export function checkBrowserSupport(): {
  fileAPI: boolean
  fileReader: boolean
  canvas: boolean
  blob: boolean
} {
  return {
    fileAPI: 'File' in window && 'FileList' in window,
    fileReader: 'FileReader' in window,
    canvas: 'HTMLCanvasElement' in window,
    blob: 'Blob' in window
  }
}
