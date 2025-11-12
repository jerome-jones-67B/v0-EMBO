// Text processing utilities

/**
 * Convert raw text to formatted HTML
 * Replicates old API processing for text formatting
 */
export function convertTextToHTML(text: string): string {
  if (!text) return ''

  // Split into paragraphs (double line breaks)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)

  return paragraphs.map(paragraph => {
    // Clean up the paragraph
    const cleanParagraph = paragraph
      .replace(/\n/g, ' ') // Convert single line breaks to spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim()

    // Basic formatting
    let formatted = cleanParagraph
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert simple URLs to links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')

    return `<p class="mb-4">${formatted}</p>`
  }).join('')
}

/**
 * Format text for display with proper line breaks
 */
export function formatTextForDisplay(text: string): string {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Extract plain text from HTML
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
