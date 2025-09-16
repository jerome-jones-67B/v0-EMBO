"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Archive,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Link,
  Trash2,
  Copy,
} from "lucide-react"

interface FileManagementProps {
  msid: string
}

// Mock file data
const mockFiles = [
  {
    id: "file1",
    filename: "figure1_source_data.xlsx",
    path: "/manuscripts/EMBO-2024-001/figures/figure1/",
    size: "2.3 MB",
    sizeBytes: 2411724,
    type: "spreadsheet",
    source: "archive",
    uploadedDate: "2024-01-15T10:30:00Z",
    uploadedBy: "Dr. John Smith",
    assignments: [
      { type: "figure", target: "Figure 1", panel: null },
      { type: "panel", target: "Figure 1", panel: "C" },
    ],
    validationStatus: "validated",
    hasErrors: false,
    hasWarnings: false,
    previewUrl: "/preview/figure1_source_data.xlsx",
    downloadUrl: "/download/figure1_source_data.xlsx",
  },
  {
    id: "file2",
    filename: "figure1_hires.tiff",
    path: "/manuscripts/EMBO-2024-001/figures/figure1/",
    size: "15.7 MB",
    sizeBytes: 16459776,
    type: "image",
    source: "archive",
    uploadedDate: "2024-01-15T10:32:00Z",
    uploadedBy: "Dr. John Smith",
    assignments: [{ type: "figure", target: "Figure 1", panel: null }],
    validationStatus: "validated",
    hasErrors: false,
    hasWarnings: false,
    previewUrl: "/preview/figure1_hires.tiff",
    downloadUrl: "/download/figure1_hires.tiff",
  },
  {
    id: "file3",
    filename: "supplementary_methods.pdf",
    path: "/manuscripts/EMBO-2024-001/supplementary/",
    size: "1.8 MB",
    sizeBytes: 1887437,
    type: "document",
    source: "uploaded",
    uploadedDate: "2024-01-18T14:20:00Z",
    uploadedBy: "Dr. Sarah Chen",
    assignments: [{ type: "manuscript", target: "EMBO-2024-001", panel: null }],
    validationStatus: "validated",
    hasErrors: false,
    hasWarnings: false,
    previewUrl: "/preview/supplementary_methods.pdf",
    downloadUrl: "/download/supplementary_methods.pdf",
  },
  {
    id: "file4",
    filename: "figure2_raw_data.zip",
    path: "/manuscripts/EMBO-2024-001/figures/figure2/",
    size: "45.2 MB",
    sizeBytes: 47398912,
    type: "archive",
    source: "archive",
    uploadedDate: "2024-01-16T09:45:00Z",
    uploadedBy: "Dr. Alice Johnson",
    assignments: [],
    validationStatus: "unassigned",
    hasErrors: true,
    hasWarnings: false,
    previewUrl: null,
    downloadUrl: "/download/figure2_raw_data.zip",
  },
  {
    id: "file5",
    filename: "protein_structure_7ABC.pdb",
    path: "/manuscripts/EMBO-2024-001/data/structures/",
    size: "892 KB",
    sizeBytes: 913408,
    type: "data",
    source: "uploaded",
    uploadedDate: "2024-01-19T11:15:00Z",
    uploadedBy: "Dr. Robert Williams",
    assignments: [
      { type: "figure", target: "Figure 1", panel: "A" },
      { type: "figure", target: "Figure 1", panel: "B" },
    ],
    validationStatus: "duplicate",
    hasErrors: false,
    hasWarnings: true,
    previewUrl: "/preview/protein_structure_7ABC.pdb",
    downloadUrl: "/download/protein_structure_7ABC.pdb",
  },
  {
    id: "file6",
    filename: "manuscript_draft_v3.docx",
    path: "/manuscripts/EMBO-2024-001/drafts/",
    size: "3.1 MB",
    sizeBytes: 3251200,
    type: "document",
    source: "uploaded",
    uploadedDate: "2024-01-20T16:30:00Z",
    uploadedBy: "Dr. Sarah Chen",
    assignments: [{ type: "manuscript", target: "EMBO-2024-001", panel: null }],
    validationStatus: "validated",
    hasErrors: false,
    hasWarnings: false,
    previewUrl: "/preview/manuscript_draft_v3.docx",
    downloadUrl: "/download/manuscript_draft_v3.docx",
  },
]

type SortField = "filename" | "size" | "uploadedDate" | "type" | "validationStatus"
type SortDirection = "asc" | "desc"

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return <ImageIcon className="w-4 h-4 text-blue-500" />
    case "document":
      return <FileText className="w-4 h-4 text-green-500" />
    case "spreadsheet":
      return <FileText className="w-4 h-4 text-emerald-500" />
    case "archive":
      return <Archive className="w-4 h-4 text-purple-500" />
    case "data":
      return <FileText className="w-4 h-4 text-orange-500" />
    default:
      return <FileText className="w-4 h-4 text-gray-500" />
  }
}

const getValidationBadge = (status: string, hasErrors: boolean, hasWarnings: boolean) => {
  if (hasErrors) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Error
      </Badge>
    )
  } else if (hasWarnings) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 border-amber-200 text-amber-700">
        <AlertCircle className="w-3 h-3" />
        Warning
      </Badge>
    )
  } else if (status === "validated") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle className="w-3 h-3" />
        Validated
      </Badge>
    )
  } else if (status === "unassigned") {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Unassigned
      </Badge>
    )
  } else if (status === "duplicate") {
    return (
      <Badge variant="outline" className="flex items-center gap-1 border-amber-200 text-amber-700">
        <Copy className="w-3 h-3" />
        Duplicate
      </Badge>
    )
  } else {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        Pending
      </Badge>
    )
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function FileManagement({ msid }: FileManagementProps) {
  const [files, setFiles] = useState(mockFiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("uploadedDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredAndSortedFiles = files.filter((file) => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !file.filename.toLowerCase().includes(searchLower) &&
        !file.path.toLowerCase().includes(searchLower) &&
        !file.uploadedBy.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Filter by type
    if (typeFilter !== "all" && file.type !== typeFilter) return false

    // Filter by source
    if (sourceFilter !== "all" && file.source !== sourceFilter) return false

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "errors" && !file.hasErrors) return false
      if (statusFilter === "warnings" && !file.hasWarnings) return false
      if (statusFilter === "validated" && file.validationStatus !== "validated") return false
      if (statusFilter === "unassigned" && file.validationStatus !== "unassigned") return false
    }

    return true
  })

  // Sort files
  filteredAndSortedFiles.sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === "uploadedDate") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    } else if (sortField === "size") {
      aValue = a.sizeBytes
      bValue = b.sizeBytes
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    Array.from(uploadedFiles).forEach((file) => {
      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return null
          if (prev >= 100) {
            clearInterval(interval)
            // Add file to list
            const newFile = {
              id: `file${Date.now()}`,
              filename: file.name,
              path: `/manuscripts/${msid}/uploads/`,
              size: formatFileSize(file.size),
              sizeBytes: file.size,
              type: file.type.startsWith("image/") ? "image" : "document",
              source: "uploaded" as const,
              uploadedDate: new Date().toISOString(),
              uploadedBy: "Current User",
              assignments: [],
              validationStatus: "unassigned" as const,
              hasErrors: false,
              hasWarnings: false,
              previewUrl: null,
              downloadUrl: `/download/${file.name}`,
            }
            setFiles((prev) => [newFile, ...prev])
            setUploadProgress(null)
            return null
          }
          return prev + 10
        })
      }, 100)
    })
  }

  const handleReassignFile = (fileId: string, newAssignment: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              assignments: [...file.assignments, { type: "figure", target: newAssignment, panel: null }] as any,
              validationStatus: "validated" as any,
            }
          : file,
      ),
    )
  }

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const totalFiles = files.length
  const validatedFiles = files.filter((f) => f.validationStatus === "validated").length
  const errorFiles = files.filter((f) => f.hasErrors).length
  const unassignedFiles = files.filter((f) => f.validationStatus === "unassigned").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">File Management</h2>
          <p className="text-sm text-muted-foreground">
            {totalFiles} files • {validatedFiles} validated • {errorFiles} errors • {unassignedFiles} unassigned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.docx,.xlsx,.tiff,.png,.jpg,.zip,.pdb"
          />
          <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search files by name, path, or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                  <SelectItem value="data">Data Files</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="errors">Errors</SelectItem>
                  <SelectItem value="warnings">Warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files ({filteredAndSortedFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("filename")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Filename {getSortIcon("filename")}
                    </Button>
                  </TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("size")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Size {getSortIcon("size")}
                    </Button>
                  </TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("uploadedDate")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Uploaded {getSortIcon("uploadedDate")}
                    </Button>
                  </TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("validationStatus")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Status {getSortIcon("validationStatus")}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    className={
                      file.hasErrors
                        ? "bg-red-50 border-l-4 border-l-red-500"
                        : file.validationStatus === "unassigned"
                          ? "bg-amber-50 border-l-4 border-l-amber-500"
                          : ""
                    }
                  >
                    <TableCell>{getFileIcon(file.type)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-xs" title={file.filename}>
                          {file.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      <span className="truncate max-w-xs" title={file.path}>
                        {file.path}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{file.size}</TableCell>
                    <TableCell>
                      <Badge variant={file.source === "uploaded" ? "default" : "secondary"} className="text-xs">
                        {file.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(file.uploadedDate).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{file.uploadedBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {file.assignments.length === 0 ? (
                          <Badge variant="outline" className="text-xs">
                            None
                          </Badge>
                        ) : (
                          file.assignments.map((assignment, index) => (
                            <Badge key={index} variant="secondary" className="text-xs mr-1">
                              {assignment.target}
                              {assignment.panel && ` (${assignment.panel})`}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getValidationBadge(file.validationStatus, file.hasErrors, file.hasWarnings)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {file.previewUrl && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                          <a href={file.downloadUrl} download>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Link className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reassign File</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Assign "{file.filename}" to a figure or panel:
                              </p>
                              <Select onValueChange={(value) => handleReassignFile(file.id, value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select assignment" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Figure 1">Figure 1</SelectItem>
                                  <SelectItem value="Figure 2">Figure 2</SelectItem>
                                  <SelectItem value="Figure 3">Figure 3</SelectItem>
                                  <SelectItem value="Supplementary">Supplementary</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No files found matching your criteria.</p>
              <p className="text-sm mt-1">Try adjusting your filters or upload new files.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
