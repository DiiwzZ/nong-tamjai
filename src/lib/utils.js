import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const PRIORITY = {
  high: {
    label: 'สูง',
    bg: 'bg-[var(--color-priority-high-bg)]',
    text: 'text-[var(--color-priority-high-text)]',
    border: 'border-red-200 dark:border-red-900',
  },
  medium: {
    label: 'กลาง',
    bg: 'bg-[var(--color-priority-medium-bg)]',
    text: 'text-[var(--color-priority-medium-text)]',
    border: 'border-yellow-200 dark:border-yellow-900',
  },
  low: {
    label: 'ต่ำ',
    bg: 'bg-[var(--color-priority-low-bg)]',
    text: 'text-[var(--color-priority-low-text)]',
    border: 'border-green-200 dark:border-green-900',
  },
}

export const DEFAULT_CATEGORIES = [
  { id: 'work', label: 'งาน', color: '#3b82f6' },
  { id: 'personal', label: 'ส่วนตัว', color: '#8b5cf6' },
  { id: 'freelance', label: 'Freelance', color: '#f59e0b' },
]

export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function daysUntil(date) {
  if (!date) return null
  const diff = new Date(date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
