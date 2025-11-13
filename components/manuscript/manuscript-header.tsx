"use client"

import { ArrowLeft, Download, FileText, Users, Calendar, Hash, FileSearch, X, ChevronDown, ChevronUp, Edit, Save, Trash2, Loader2, Image, Eye, Link2, ExternalLink, Plus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ManuscriptDetailData } from '@/types/manuscript-detail'
import type { Priority } from '@/types/manuscript'
import type { LinkCreate } from '@/lib/types'
import { formatDate } from "@/lib/utils/date-utils"
import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api-client"
import { ManuallyMarkedChecksModal } from './manually-marked-checks-modal'
import { useToast } from "@/hooks/use-toast"

// Convert raw text to formatted HTML (replicating old API processing)
function convertTextToHTML(text: string): string {
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

interface ManuscriptHeaderProps {
  manuscript: ManuscriptDetailData
  onDownload?: () => void
  onBack?: () => void
  onNotesChange?: (notes: string) => void
  onLinksChange?: () => void
}

export function ManuscriptHeader({ manuscript, onDownload, onBack, onNotesChange, onLinksChange }: ManuscriptHeaderProps) {
  const { toast } = useToast()
  const [showFullText, setShowFullText] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesContent, setNotesContent] = useState(manuscript.notes || "")
  const [manuscriptContent, setManuscriptContent] = useState<any>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)
  const [showFigurePreview, setShowFigurePreview] = useState(false)
  const [figurePreviews, setFigurePreviews] = useState<Map<number, string>>(new Map())
  const [loadingPreviews, setLoadingPreviews] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [manuscriptFiles, setManuscriptFiles] = useState<any[]>([])
  const [filesLoaded, setFilesLoaded] = useState(false)


  // Fetch figure previews
  const fetchFigurePreviews = async () => {
    if (!manuscript.figures || manuscript.figures.length === 0) return

    setLoadingPreviews(true)
    const previews = new Map<number, string>()

    try {
      for (const figure of manuscript.figures) {
        if (figure.image_file_id) {
          try {
            const previewUrl = `https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1/manuscripts/${manuscript.id}/files/${figure.image_file_id}/preview`
            const response = await fetch(previewUrl, {
              headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTc1MjAyOTksImV4cCI6MTc4ODYyNDI5OSwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.z8-At4lk5g1z1PqFxvGCDJfKr4qoUgM0GWMqxmebZpo'
              }
            })

            if (response.ok) {
              const blob = await response.blob()
              const objectUrl = URL.createObjectURL(blob)
              previews.set(figure.id, objectUrl)
            }
          } catch (error) {
            console.warn(`Failed to load preview for figure ${figure.id}:`, error)
          }
        }
      }
      setFigurePreviews(previews)
    } catch (error) {
      console.error('Failed to fetch figure previews:', error)
    } finally {
      setLoadingPreviews(false)
    }
  }

  // Fetch manuscript content when full text view is opened
  const fetchManuscriptContent = async () => {
    if (manuscriptContent) return // Already loaded

    setIsLoadingContent(true)
    setContentError(null)

    try {
      // Use Data4Rev API directly for static builds
      console.log('📄 Fetching manuscript content from Data4Rev API for:', manuscript.id || manuscript.msid)
      const rawContent = await api.manuscripts.getContent(manuscript.id || manuscript.msid)
      // API now returns raw text directly, not wrapped in response object

      // Convert raw text to formatted HTML for better display (like the old API did)
      const htmlContent = rawContent && typeof rawContent === 'string' ? convertTextToHTML(rawContent) : ''

      // Structure the response to match expected format
      const contentData = {
        content: htmlContent,
        content_type: 'text/html', // Convert to HTML for rich formatting
        word_count: rawContent && typeof rawContent === 'string' ? rawContent.split(/\s+/).filter((word: string) => word.length > 0).length : 0,
        source: 'data4rev-api',
        fallback: false
      }

      setManuscriptContent(contentData)
    } catch (error) {
      console.error('Failed to fetch manuscript content:', error)

      // Handle specific error types
      if (error instanceof ApiError && error.status === 404) {
        setContentError('No content is available for this manuscript yet.')
      } else {
        setContentError(error instanceof Error ? error.message : 'Failed to load content')
      }
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Open full text view and fetch content
  const openFullTextView = () => {
    setShowFullText(true)
    fetchManuscriptContent()
  }

  // Fetch manuscript files
  const fetchManuscriptFiles = async () => {
    if (filesLoaded) return manuscriptFiles

    try {
      console.log('📁 Fetching manuscript files for:', manuscript.id)
      const filesResponse = await api.files.getByManuscriptId(manuscript.id)
      const files = Array.isArray(filesResponse) ? filesResponse : (filesResponse as any)?.data || []
      setManuscriptFiles(files)
      setFilesLoaded(true)
      console.log('✅ Manuscript files loaded:', files)
      return files
    } catch (error) {
      console.error('❌ Failed to fetch manuscript files:', error)
      return []
    }
  }

  // Handle file download
  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      // Fetch files if not already loaded
      const files = await fetchManuscriptFiles()

      if (!files || files.length === 0) {
        toast({
          title: "No Files Available",
          description: "No manuscript files found to download",
          variant: "destructive",
        })
        return
      }

      // Find the main manuscript file (PDF or document)
      // Priority: PDF files, then any document files
      const manuscriptFile = files.find((f: any) =>
        f.content_type?.includes('pdf') ||
        f.filename?.toLowerCase().endsWith('.pdf')
      ) || files.find((f: any) =>
        f.content_type?.includes('document') ||
        f.content_type?.includes('word') ||
        f.filename?.toLowerCase().match(/\.(doc|docx|txt)$/)
      ) || files[0] // Fallback to first file

      console.log('📥 Downloading file:', manuscriptFile.filename, 'ID:', manuscriptFile.id)

      // Download the file using the API
      const blob = await api.files.download(manuscript.id, manuscriptFile.id.toString())

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = manuscriptFile.filename || `manuscript_${manuscript.msid}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('✅ Download completed:', manuscriptFile.filename)

      toast({
        title: "Download Started",
        description: `Downloading ${manuscriptFile.filename}`,
        variant: "default",
      })
    } catch (error) {
      console.error('❌ Download failed:', error)

      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to download manuscript file'

      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle deposit to BioStudies
  const handleDeposit = async () => {
    setIsDepositing(true)
    try {
      console.log('📤 Depositing manuscript to BioStudies:', manuscript.id)
      const response = await api.manuscripts.deposit(manuscript.id)

      toast({
        title: "Success",
        description: "Manuscript deposited to BioStudies successfully",
        variant: "default",
      })

      console.log('✅ Deposit successful:', response)
    } catch (error) {
      console.error('❌ Deposit failed:', error)

      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to deposit manuscript to BioStudies'

      toast({
        title: "Deposit Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDepositing(false)
    }
  }


  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return 'default'
      case 'pending review':
        return 'secondary'
      case 'ready for publication':
        return 'default'
      case 'on hold':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack || (() => window.history.back())}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <h1 className="text-2xl font-bold leading-tight">
        {manuscript.title}
      </h1>
      {/* Main Content Layout - Following Image Design Exactly */}
      <div className="flex gap-6">
        {/* Left Column - Main Information */}
        <div className="flex-1 space-y-3">
          {/* Title */}


          {/* Authors - clean, no labels */}
          <p className="text-base">
            {manuscript.authors}
          </p>

          {/* Manuscript ID with Full Text Icon and Download */}
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold">
              {manuscript.msid}
            </div>
            <Button onClick={openFullTextView} variant="ghost" size="sm" className="h-6 w-6 p-0">
              <FileSearch className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>          {/* Assignee */}
          <div className="text-sm flex items-center gap-2 ml-5">
            <span>{manuscript.assignedTo || 'Unassigned'}</span>
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
          </div>
          </div>

          {/* Date information - no labels, just formatted dates */}
          <div className="text-sm flex gap-2 space-y-1">
            <div>Received: {formatDate(manuscript.receivedDate)}</div>
            <div>Last changed: {formatDate(manuscript.lastModified)}</div>
             {/* Status */}
          <div className="text-sm">{manuscript.status}
          </div>


          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-64 space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleDeposit}
            disabled={isDepositing}
          >
            {isDepositing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Depositing...
              </>
            ) : (
              'Deposit to BioStudies'
            )}
          </Button>

          <ManuallyMarkedChecksModal
            manuscriptId={manuscript.id}
            trigger={
              <Button variant="outline" className="w-full" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Manually Marked Checks
              </Button>
            }
          />

          {/* Identifier information */}
          <div className="text-sm space-y-1">
            {manuscript.accessionNumber && (
              <div>
                <a
                  href={`https://www.ebi.ac.uk/biostudies/studies/${manuscript.accessionNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline hover:text-blue-800"
                >
                  {manuscript.accessionNumber}
                </a>
              </div>
            )}
            {manuscript.doi && (
              <div>
                <a
                  href={`https://doi.org/${manuscript.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline hover:text-blue-800"
                >
                  {manuscript.doi}
                </a>
              </div>
            )}
          </div>



        </div>
      </div>

      {/* Notes Section - Collapsible and Editable */}
      <Card>
        <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="py-0 px-6 h-10 cursor-pointer hover:bg-muted/50 transition-colors flex items-center">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm leading-none m-0 p-0">Notes</CardTitle>
                <div className="flex items-center gap-2">
                  {notesContent && (
                    <span className="text-xs text-muted-foreground leading-none">
                      {notesContent.length} characters
                    </span>
                  )}
                  {isNotesOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {isEditingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    placeholder="Add your notes here..."
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onNotesChange?.(notesContent)
                        setIsEditingNotes(false)
                      }}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNotesContent(manuscript.notes || "")
                        setIsEditingNotes(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setNotesContent("")
                        onNotesChange?.("")
                        setIsEditingNotes(false)
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="min-h-[60px]">
                    {notesContent ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {notesContent}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No notes added yet. Click edit to add notes.
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Full Page Manuscript Overlay */}
      {showFullText && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFullText(false)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
              <h1 className="text-xl font-semibold">Full Manuscript: {manuscript.msid}</h1>
            </div>
            <div className="flex items-center gap-2">
              {manuscriptContent && (
                <Badge variant="outline">
                  {manuscriptContent.word_count} words
                </Badge>
              )}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Title and Authors */}
                <div className="text-center border-b pb-8 mb-8">
                  <h1 className="text-4xl font-bold mb-6 leading-tight">{manuscript.title}</h1>
                  <p className="text-xl text-gray-700 mb-4">{manuscript.authors}</p>
                  <div className="flex justify-center gap-6 text-sm text-gray-600">
                    <span>Received: {formatDate(manuscript.receivedDate)}</span>
                    <span>•</span>
                    <span>Status: {manuscript.status}</span>
                    {manuscript.doi && (
                      <>
                        <span>•</span>
                        <a
                          href={`https://doi.org/${manuscript.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {manuscript.doi}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Full Content - Clean Document Style */}
                <div className="manuscript-content">
                  {isLoadingContent ? (
                    <div className="text-center py-16">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-gray-400" />
                      <p className="text-gray-600 text-lg">Loading manuscript content...</p>
                    </div>
                  ) : contentError ? (
                    <div className="text-center py-16">
                      <p className="text-red-600 mb-6 text-lg">{contentError}</p>
                      <Button onClick={fetchManuscriptContent} variant="outline">
                        <Loader2 className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  ) : manuscriptContent ? (
                    <div className="space-y-6">
                      {manuscriptContent.content_type === 'text/html' ? (
                        <div
                          className="prose prose-lg max-w-none leading-relaxed text-gray-800"
                          style={{
                            fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                            lineHeight: '1.75'
                          }}
                          dangerouslySetInnerHTML={{ __html: manuscriptContent.content }}
                        />
                      ) : manuscriptContent.content_type === 'text/markdown' ? (
                        <div className="prose prose-lg max-w-none">
                          <pre className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-white border-0 p-0">
                            {manuscriptContent.content}
                          </pre>
                        </div>
                      ) : (
                        <div
                          className="prose prose-lg max-w-none"
                          style={{
                            fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                            lineHeight: '1.75'
                          }}
                        >
                          <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                            {manuscriptContent.content}
                          </div>
                        </div>
                      )}

                      {/* Content Footer */}
                      <div className="mt-12 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Source: {manuscriptContent.source}</span>
                          <span>{manuscriptContent.word_count} words</span>
                        </div>
                        {manuscriptContent.fallback && (
                          <p className="text-amber-600 mt-3 text-sm">
                            ⚠️ This is fallback content as the API data was unavailable.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <FileSearch className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No content available</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

    </div>
  )
}
