import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate BMI (Body Mass Index)
 * @param weight Weight in kilograms
 * @param height Height in centimeters
 * @returns BMI value rounded to 1 decimal place
 */
export function calculateBMI(weight: number, height: number): string {
  if (height <= 0 || weight <= 0) return '0.0'
  return (weight / Math.pow(height / 100, 2)).toFixed(1)
}
