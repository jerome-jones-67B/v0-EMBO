"use client"

import { ArrowLeft, Download, FileText, Users, Calendar, Hash } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ManuscriptDetailData } from '@/types/manuscript-detail'
import type { Priority } from '@/types/manuscript'
import { formatDate } from "@/lib/utils/date-utils"

interface ManuscriptHeaderProps {
  manuscript: ManuscriptDetailData
  onDownload?: () => void
}

export function ManuscriptHeader({ manuscript, onDownload }: ManuscriptHeaderProps) {
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
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {manuscript.msid}
          </Badge>
          <Badge variant={getStatusColor(manuscript.status)}>
            {manuscript.status}
          </Badge>
          <Badge variant={getPriorityColor(manuscript.priority)}>
            {manuscript.priority} priority
          </Badge>
        </div>

        <div className="ml-auto">
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Manuscript Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl leading-tight">
            {manuscript.title}
          </CardTitle>
          <CardDescription className="text-base">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {manuscript.authors}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Received {formatDate(manuscript.receivedDate)}
              </div>
              {manuscript.doi && (
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <a 
                    href={`https://doi.org/${manuscript.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {manuscript.doi}
                  </a>
                </div>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assignment Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Assignment</h4>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Assigned to:</span>{' '}
                  {manuscript.assignedTo || 'Unassigned'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Last modified:</span>{' '}
                  {formatDate(manuscript.lastModified)}
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Technical</h4>
              <div className="space-y-1">
                {manuscript.accessionNumber && (
                  <div className="text-sm">
                    <span className="font-medium">Accession:</span>{' '}
                    {manuscript.accessionNumber}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Figures:</span>{' '}
                  {manuscript.figures?.length || 0}
                </div>
                <div className="text-sm">
                  <span className="font-medium">QC checks:</span>{' '}
                  {manuscript.qcChecks?.length || 0}
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Current status:</span>{' '}
                  {manuscript.status}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Priority:</span>{' '}
                  {manuscript.priority}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {manuscript.notes && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>
                <p className="text-sm">{manuscript.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}