export const MAX_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_SIZE_MB = 10

export function validateCVFile(file: File): { valid: boolean; error?: string } {
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are supported' }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: `File size must be ${MAX_SIZE_MB} MB or less` }
  }
  return { valid: true }
}
