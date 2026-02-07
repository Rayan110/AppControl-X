import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { deviceModels } from '@/data/deviceModels'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Gets the marketing name for a device model code.
 * Falls back to the original model code if no mapping is found.
 */
export function getMarketingName(model: string): string {
  if (!model) return model
  
  // Try exact match
  if (deviceModels[model]) {
    return deviceModels[model]
  }

  // Some models might be "BRAND MODEL_CODE" or have extra info
  // Try to find the code within the string
  // We sort by length descending to match the most specific code first
  const codes = Object.keys(deviceModels).sort((a, b) => b.length - a.length)
  for (const code of codes) {
    if (model.includes(code)) {
      return deviceModels[code]
    }
  }

  return model
}
