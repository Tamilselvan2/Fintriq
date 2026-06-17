import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  const currency = typeof window !== 'undefined' ? localStorage.getItem('fintriq_currency') || 'USD' : 'USD';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatCompactCurrency(amount: number) {
  const currency = typeof window !== 'undefined' ? localStorage.getItem('fintriq_currency') || 'USD' : 'USD';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(amount)
}


export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}
