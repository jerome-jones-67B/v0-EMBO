export function sortByString(a: string, b: string, direction: 'asc' | 'desc' = 'asc'): number {
  const comparison = a.localeCompare(b)
  return direction === 'asc' ? comparison : -comparison
}

export function sortByDate(a: string | Date, b: string | Date, direction: 'asc' | 'desc' = 'asc'): number {
  const dateA = new Date(a)
  const dateB = new Date(b)
  const comparison = dateA.getTime() - dateB.getTime()
  return direction === 'asc' ? comparison : -comparison
}

export function sortByNumber(a: number, b: number, direction: 'asc' | 'desc' = 'asc'): number {
  const comparison = a - b
  return direction === 'asc' ? comparison : -comparison
}

export interface SortableItem {
  [key: string]: any
}

export function sortItems<T extends SortableItem>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortByString(aValue, bValue, direction)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortByNumber(aValue, bValue, direction)
    }

    if ((aValue as any) instanceof Date || (bValue as any) instanceof Date || 
        (typeof aValue === 'string' && !isNaN(Date.parse(aValue)))) {
      return sortByDate(aValue, bValue, direction)
    }

    // Fallback to string comparison
    return sortByString(String(aValue), String(bValue), direction)
  })
}