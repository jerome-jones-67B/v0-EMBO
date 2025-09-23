"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Download, AlertTriangle } from "lucide-react"
import { Manuscript } from "@/types/manuscript"

interface DownloadProgress {
  status: string
  progress: number
  currentFile?: string
  totalFiles?: number
  downloadedFiles?: number
  currentFileSize?: string
  downloadSpeed?: string
}

interface DownloadProgressToastProps {
  manuscripts: Manuscript[]
  downloadProgress: Record<string, DownloadProgress>
  showDownloadToast: Record<string, boolean>
  onHideToast: (msid: string) => void
  onAbortDownload: (msid: string) => void
}

export default function DownloadProgressToast({
  manuscripts,
  downloadProgress,
  showDownloadToast,
  onHideToast,
  onAbortDownload,
}: DownloadProgressToastProps) {
  const activeDownloads = Object.entries(showDownloadToast).filter(([_, show]) => show)

  if (activeDownloads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {activeDownloads.map(([msid, _]) => {
        const progress = downloadProgress[msid]
        const manuscript = manuscripts.find(m => m.msid === msid)
        
        if (!progress || !manuscript) return null

        const isError = progress.status.toLowerCase().includes('error') || 
                       progress.status.toLowerCase().includes('failed')
        const isComplete = progress.status.toLowerCase().includes('complete') ||
                          progress.progress >= 100
        const isCancelled = progress.status.toLowerCase().includes('cancel')

        return (
          <Card key={msid} className="w-80 bg-white shadow-lg border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{manuscript.title}</h4>
                  <p className="text-xs text-gray-500">MSID: {msid}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHideToast(msid)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {isError ? (
                      <span className="text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Download Failed
                      </span>
                    ) : isComplete ? (
                      <span className="text-green-600 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download Complete
                      </span>
                    ) : isCancelled ? (
                      <span className="text-gray-600">Download Cancelled</span>
                    ) : (
                      <span className="text-blue-600 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Downloading...
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(progress.progress)}%
                  </span>
                </div>

                <Progress 
                  value={progress.progress} 
                  className={`h-2 ${isError ? 'bg-red-100' : isComplete ? 'bg-green-100' : ''}`}
                />

                <div className="text-xs text-gray-600">
                  {progress.currentFile && (
                    <p className="truncate">
                      {progress.currentFile}
                      {progress.totalFiles && progress.downloadedFiles !== undefined && (
                        <span className="ml-1 text-blue-500">
                          ({progress.downloadedFiles}/{progress.totalFiles} files)
                        </span>
                      )}
                    </p>
                  )}
                  
                  {progress.currentFileSize && (
                    <p className="text-gray-500">Size: {progress.currentFileSize}</p>
                  )}
                  
                  {progress.downloadSpeed && (
                    <p className="text-gray-500">Speed: {progress.downloadSpeed}</p>
                  )}
                </div>

                {!isComplete && !isError && !isCancelled && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAbortDownload(msid)}
                      className="w-full text-xs"
                    >
                      Cancel Download
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
