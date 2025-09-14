import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${Number(value).toFixed(decimals)}%`
}

export function hexToRgba(hex: string, alpha = 1): string {
  // Remove the hash if it exists
  const hexValue = hex.replace('#', '')
  
  // Parse r, g, b values
  const r = parseInt(hexValue.substring(0, 2), 16)
  const g = parseInt(hexValue.substring(2, 4), 16)
  const b = parseInt(hexValue.substring(4, 6), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getContrastTextColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  // Calculate luminance using the WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}
