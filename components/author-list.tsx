import React from 'react'

interface AuthorListProps {
  authors: string | string[]
  className?: string
  searchTerm?: string
}

export function AuthorList({ authors, className = "", searchTerm }: AuthorListProps) {
  // Handle both string and array formats
  const authorList = React.useMemo(() => {
    if (Array.isArray(authors)) {
      return authors
    }
    
    // If it's already a comma-separated string, split it
    if (typeof authors === 'string') {
      return authors.split(',').map(author => author.trim()).filter(Boolean)
    }
    
    return []
  }, [authors])

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (authorList.length === 0) {
    return <span className={`text-sm text-muted-foreground italic ${className}`}>No authors listed</span>
  }

  return (
    <div className={`text-sm ${className}`}>
      {authorList.map((author, index) => (
        <span key={index} className="font-medium text-foreground whitespace-nowrap inline-block">
          {searchTerm ? highlightSearchTerm(author, searchTerm) : author}
          {index < authorList.length - 1 && (
            <span className="text-muted-foreground">, </span>
          )}
        </span>
      ))}
    </div>
  )
}
