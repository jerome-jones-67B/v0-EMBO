// Dashboard-specific types and constants

export type SortField = "msid" | "receivedDate" | "title" | "authors" | "status" | "priority" | "lastModified"
export type SortDirection = "asc" | "desc"

export interface AIChecksSummary {
  total: number
  errors: number
  warnings: number
  info: number
  dismissed: number
}

export interface DownloadProgress {
  status: string
  progress: number
  currentFile?: string
  totalFiles?: number
  downloadedFiles?: number
  currentFileSize?: string
  downloadSpeed?: string
}

export interface DownloadState {
  downloadingManuscripts: Set<string>
  downloadProgress: Record<string, DownloadProgress>
  showDownloadToast: Record<string, boolean>
  downloadConnections: Record<string, EventSource | null>
  downloadAbortControllers: Record<string, AbortController | null>
}
