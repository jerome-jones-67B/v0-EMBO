"use client"

import { ArrowLeft, Download, FileText, Users, Calendar, Hash, FileSearch, X, ChevronDown, ChevronUp, Edit, Save, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ManuscriptDetailData } from '@/types/manuscript-detail'
import type { Priority } from '@/types/manuscript'
import { formatDate } from "@/lib/utils/date-utils"
import { useState, useEffect } from "react"

interface ManuscriptHeaderProps {
  manuscript: ManuscriptDetailData
  onDownload?: () => void
  onBack?: () => void
  onNotesChange?: (notes: string) => void
}

export function ManuscriptHeader({ manuscript, onDownload, onBack, onNotesChange }: ManuscriptHeaderProps) {
  const [showFullText, setShowFullText] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesContent, setNotesContent] = useState(manuscript.notes || "")
  const [manuscriptContent, setManuscriptContent] = useState<any>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)
  
  // Fetch manuscript content when full text view is opened
  const fetchManuscriptContent = async () => {
    if (manuscriptContent) return // Already loaded
    
    setIsLoadingContent(true)
    setContentError(null)
    
    try {
      const response = await fetch(`/api/v1/manuscripts/${manuscript.id}/content`, {
        headers: {
          'Cookie': document.cookie,
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`)
      }
      
      // Check content type to determine how to handle the response
      const contentType = response.headers.get('content-type') || ''
      
      let contentData
      if (contentType.includes('application/json')) {
        // Handle JSON response (from our API wrapper)
        contentData = await response.json()
      } else {
        // Handle direct text/HTML response from Data4Rev API
        const textContent = await response.text()
        contentData = {
          content: textContent,
          content_type: contentType.includes('text/html') ? 'text/html' : 'text/plain',
          word_count: textContent.split(/\s+/).filter(word => word.length > 0).length,
          source: 'data4rev-api',
          fallback: false
        }
      }
      
      setManuscriptContent(contentData)
    } catch (error) {
      console.error('Failed to fetch manuscript content:', error)
      setContentError(error instanceof Error ? error.message : 'Failed to load content')
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Open full text view and fetch content
  const openFullTextView = () => {
    setShowFullText(true)
    fetchManuscriptContent()
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
            <Button onClick={onDownload} variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Download className="h-4 w-4" />
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
          <Button className="w-full" size="lg">
            Deposit to BioStudies
          </Button>
          
          {/* Identifier information */}
          <div className="text-sm space-y-1">
            {manuscript.accessionNumber && (
              <div>
                <span className="text-blue-600 hover:underline cursor-pointer hover:text-blue-800">
                  {manuscript.accessionNumber}
                </span>
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
              <Button onClick={onDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
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