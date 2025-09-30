import { convertTextToHTML, formatTextForDisplay, truncateText, stripHtmlTags } from '@/lib/text-utils'

describe('text-utils', () => {
  describe('convertTextToHTML', () => {
    it('should convert plain text to HTML with paragraphs', () => {
      const text = 'First paragraph.\n\nSecond paragraph.'
      const result = convertTextToHTML(text)
      
      expect(result).toContain('<p class="mb-4">First paragraph.</p>')
      expect(result).toContain('<p class="mb-4">Second paragraph.</p>')
    })

    it('should handle bold text formatting', () => {
      const text = 'This is **bold** text.'
      const result = convertTextToHTML(text)
      
      expect(result).toContain('<strong>bold</strong>')
    })

    it('should handle italic text formatting', () => {
      const text = 'This is *italic* text.'
      const result = convertTextToHTML(text)
      
      expect(result).toContain('<em>italic</em>')
    })

    it('should convert URLs to links', () => {
      const text = 'Visit https://example.com for more info.'
      const result = convertTextToHTML(text)
      
      expect(result).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">https://example.com</a>')
    })

    it('should handle empty text', () => {
      const result = convertTextToHTML('')
      expect(result).toBe('')
    })

    it('should handle null/undefined text', () => {
      expect(convertTextToHTML(null as any)).toBe('')
      expect(convertTextToHTML(undefined as any)).toBe('')
    })
  })

  describe('formatTextForDisplay', () => {
    it('should convert line breaks to HTML breaks', () => {
      const text = 'Line 1\nLine 2'
      const result = formatTextForDisplay(text)
      
      expect(result).toBe('Line 1<br>Line 2')
    })

    it('should handle empty text', () => {
      const result = formatTextForDisplay('')
      expect(result).toBe('')
    })
  })

  describe('truncateText', () => {
    it('should truncate text longer than max length', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      
      expect(result).toBe('This is a very long ...')
    })

    it('should not truncate text shorter than max length', () => {
      const text = 'Short text'
      const result = truncateText(text, 20)
      
      expect(result).toBe('Short text')
    })

    it('should handle empty text', () => {
      const result = truncateText('', 10)
      expect(result).toBe('')
    })
  })

  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      const html = '<p>This is <strong>bold</strong> text.</p>'
      const result = stripHtmlTags(html)
      
      expect(result).toBe('This is bold text.')
    })

    it('should handle empty HTML', () => {
      const result = stripHtmlTags('')
      expect(result).toBe('')
    })
  })
})
