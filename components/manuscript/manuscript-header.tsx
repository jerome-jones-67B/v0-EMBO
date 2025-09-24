"use client"

import { ArrowLeft, Download, FileText, Users, Calendar, Hash, FileSearch, X, ChevronDown, ChevronUp, Edit, Save, Trash2 } from "lucide-react"
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
import { useState } from "react"

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

      {/* Main Content Layout - Following Image Design Exactly */}
      <div className="flex gap-6">
        {/* Left Column - Main Information */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <h1 className="text-2xl font-bold leading-tight">
            {manuscript.title}
          </h1>
          
          {/* Authors - clean, no labels */}
          <p className="text-base">
            {manuscript.authors}
          </p>
          
          {/* Manuscript ID with Full Text Icon */}
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold">
              {manuscript.msid}
            </div>
            <Dialog open={showFullText} onOpenChange={setShowFullText}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <FileSearch className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Full Manuscript: {manuscript.msid}</span>
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] w-full">
                  <div className="space-y-6 p-4">
                    {/* Title Section */}
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{manuscript.title}</h1>
                      <p className="text-muted-foreground">{manuscript.authors}</p>
                    </div>
                    
                    {/* Abstract/Summary */}
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Abstract</h2>
                      <p className="text-sm leading-relaxed">
                        This manuscript presents a comprehensive analysis of the molecular mechanisms underlying protein quality control. 
                        The research demonstrates novel insights into cellular homeostasis and provides evidence for therapeutic targets 
                        in neurodegenerative diseases. Through advanced microscopy techniques and biochemical assays, we have identified 
                        key regulatory pathways that maintain protein folding fidelity under stress conditions.
                      </p>
                    </div>

                    {/* Methods */}
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Methods</h2>
                      <p className="text-sm leading-relaxed">
                        Cell culture, protein purification, and imaging techniques were employed as described previously. 
                        Statistical analysis was performed using standard protocols with appropriate controls.
                      </p>
                    </div>

                    {/* Results */}
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Results</h2>
                      <p className="text-sm leading-relaxed">
                        Our findings reveal significant changes in protein aggregation patterns under different stress conditions. 
                        The data supports the hypothesis that molecular chaperones play a critical role in maintaining cellular viability.
                      </p>
                    </div>

                    {/* Figures Reference */}
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Figures</h2>
                      <div className="space-y-2">
                        {manuscript.figures?.map((figure, index) => (
                          <div key={figure.id} className="border-l-2 border-blue-200 pl-3">
                            <p className="font-medium text-sm">Figure {index + 1}: {figure.title}</p>
                            <p className="text-xs text-muted-foreground">{figure.legend}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Discussion */}
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Discussion</h2>
                      <p className="text-sm leading-relaxed">
                        These results contribute to our understanding of protein quality control mechanisms and provide 
                        a foundation for future therapeutic interventions. The implications for human health are significant, 
                        particularly in the context of aging and disease.
                      </p>
                    </div>

                    {/* References */}
                    <div>
                      <h2 className="text-lg font-semibold mb-2">References</h2>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Author, A. et al. Important findings in cell biology. <em>Nature</em> 123, 456-789 (2024).</li>
                        <li>Researcher, B. & Scientist, C. Molecular mechanisms of protein folding. <em>Cell</em> 87, 123-456 (2024).</li>
                        <li>Expert, D. Quality control in cellular systems. <em>Science</em> 321, 987-654 (2024).</li>
                      </ol>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Date information - no labels, just formatted dates */}
          <div className="text-sm space-y-1">
            <div>Received: 2025-09-09 14:24</div>
            <div>Last changed: 2025-12-08 09:06</div>
          </div>
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="w-64 space-y-3">
          <Button className="w-full" size="lg">
            Deposit to BioStudies
          </Button>
          
          {/* Identifier information */}
          <div className="text-sm space-y-1">
            <div>S-SCDT-10_103B-544319-024-00165-Y</div>
            <div>10.103B/544319-024-00165-y</div>
          </div>
          
          {/* Status */}
          <div className="text-sm">
            <div>In progress</div>
          </div>
          
          {/* Assignee */}
          <div className="text-sm flex items-center gap-2">
            <span>Unassigned</span>
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
          </div>
          
          <div className="pt-2">
            <Button onClick={onDownload} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Notes Section - Collapsible and Editable */}
      <Card>
        <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notes</CardTitle>
                <div className="flex items-center gap-2">
                  {notesContent && (
                    <span className="text-xs text-muted-foreground">
                      {notesContent.length} characters
                    </span>
                  )}
                  {isNotesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
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
    </div>
  )
}