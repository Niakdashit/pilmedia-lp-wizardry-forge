// Default color palette for the application
export const defaultColors = {
  // Primary brand color
  primary: '#44444d',
  
  // Secondary brand color
  secondary: '#dc2626',
  
  // Accent color
  accent: '#ffffff',
  
  // Text colors
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    inverted: '#ffffff',
  },
  
  // Background colors
  background: {
    light: '#ffffff',
    dark: '#111827',
  },
  
  // Border colors
  border: {
    light: '#e5e7eb',
    dark: '#374151',
  },
  
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Wheel segment colors
  wheelSegments: [
    '#44444d', // Primary brand color
    '#4ecdc4', // Teal
    '#45b7d1', // Light blue
    '#96ceb4', // Mint
    '#feca57', // Yellow
    '#ff9ff3', // Pink
    '#ff6b6b', // Red
    '#48dbfb', // Sky blue
    '#1dd1a1', // Green
    '#ff9f43', // Orange
    '#5f27cd', // Purple
    '#54a0ff', // Blue
  ],
} as const;

export type ColorPalette = typeof defaultColors;
