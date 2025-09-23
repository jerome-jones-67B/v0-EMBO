export function formatDate(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getRelativeTime(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  const diffInDays = diffInHours / 24

  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)} weeks ago`
  } else {
    return formatDate(d)
  }
}