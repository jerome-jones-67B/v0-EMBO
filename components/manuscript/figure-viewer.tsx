"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, AlertTriangle, CheckCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { buildApiUrl, config } from '@/lib/config'
import type { FigureDetails, PanelDetails, CheckResultDetails } from '@/lib/types'

interface FigureViewerProps {
  figures: FigureDetails[]
  selectedFigureIndex: number
  onFigureChange: (index: number) => void
  onNextFigure: () => void
  onPreviousFigure: () => void
  manuscriptId?: string
}

export function FigureViewer({
  figures,
  selectedFigureIndex,
  onFigureChange,
  onNextFigure,
  onPreviousFigure,
  manuscriptId
}: FigureViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedPanelIndex, setSelectedPanelIndex] = useState(0)
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  // Image cache for loaded images
  const imageCache = useRef<Map<string, string>>(new Map())

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageCache.current.forEach((url: string) => URL.revokeObjectURL(url))
    }
  }, [])

  if (!figures || figures.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">No figures available</p>
        </CardContent>
      </Card>
    )
  }

  const currentFigure = figures[selectedFigureIndex]
  if (!currentFigure) return null

  const currentPanel = currentFigure.panels?.[selectedPanelIndex]

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50))

  // Helper function to load image with authentication
  const loadImageWithAuth = useCallback(async (fileId: number): Promise<string | null> => {
    const cacheKey = `file-${fileId}`

    // Check cache first
    if (imageCache.current.has(cacheKey)) {
      return imageCache.current.get(cacheKey)!
    }

    // Check if already loading
    if (loadingImages.has(cacheKey)) {
      return null
    }

    if (!manuscriptId) {
      return null
    }

    try {
      setLoadingImages(prev => new Set(prev).add(cacheKey))

      const previewUrl = buildApiUrl(`/v1/manuscripts/${manuscriptId}/files/${fileId}/preview`)
      const authToken = config.api.token

      const response = await fetch(previewUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        // Cache the result
        imageCache.current.set(cacheKey, objectUrl)
        setImageUrls(prev => new Map(prev).set(cacheKey, objectUrl))

        return objectUrl
      } else {
        console.warn(`Failed to get preview for file ${fileId}:`, response.status, response.statusText)
      }
    } catch (error) {
      console.warn(`Network error for file ${fileId}:`, error)
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(cacheKey)
        return newSet
      })
    }

    return null
  }, [manuscriptId])

  // Helper function to get image path for a panel
  const getPanelImagePath = (panel: PanelDetails) => {
    // Try to get image from source_data first - this is the real API data
    if (panel.source_data && panel.source_data.length > 0) {
      const sourceData = panel.source_data[0]
      const cacheKey = `file-${sourceData.file_id}`

      // Return cached URL if available
      if (imageUrls.has(cacheKey)) {
        return imageUrls.get(cacheKey)!
      }

      // Trigger loading if not already loading
      if (!loadingImages.has(cacheKey)) {
        loadImageWithAuth(sourceData.file_id)
      }

      return '/placeholder.svg' // Show placeholder while loading
    }

    // If no source data, try to get from figure level source data
    if (currentFigure.source_data && currentFigure.source_data.length > 0) {
      const sourceData = currentFigure.source_data[0]
      const cacheKey = `file-${sourceData.file_id}`

      // Return cached URL if available
      if (imageUrls.has(cacheKey)) {
        return imageUrls.get(cacheKey)!
      }

      // Trigger loading if not already loading
      if (!loadingImages.has(cacheKey)) {
        loadImageWithAuth(sourceData.file_id)
      }

      return '/placeholder.svg' // Show placeholder while loading
    }

    // Fallback to a placeholder if no source data is available
    return '/placeholder.svg'
  }

  const getCheckIcon = (check: CheckResultDetails) => {
    switch (check.status) {
      case 'error':
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getCheckId = (check: CheckResultDetails, type: string, index: number) => {
    return check.id || `${type}-check-${index}`
  }

  return (
    <div className="space-y-6">
      {/* Figure Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousFigure}
            disabled={selectedFigureIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Figure {selectedFigureIndex + 1} of {figures.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextFigure}
            disabled={selectedFigureIndex === figures.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoomLevel}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Figure Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Figure {currentFigure.label}</CardTitle>
              <CardDescription>{currentFigure.caption}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPanel ? (
                <div className="space-y-4">
                  <div className="relative overflow-auto border rounded-lg">
                    {(() => {
                      const imagePath = getPanelImagePath(currentPanel)
                      const sourceData = currentPanel.source_data?.[0]
                      const cacheKey = sourceData ? `file-${sourceData.file_id}` : null
                      const isLoading = cacheKey && loadingImages.has(cacheKey)

                      return (
                        <div className="relative">
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                          )}
                          <Image
                            src={imagePath}
                            alt={currentPanel.caption || `Panel ${currentPanel.label}`}
                            width={600}
                            height={400}
                            style={{
                              transform: `scale(${zoomLevel / 100})`,
                              transformOrigin: 'top left',
                              maxWidth: 'none'
                            }}
                            className="transition-transform duration-200"
                            onError={(e) => {
                              console.warn(`Failed to load image for panel ${currentPanel.label}`)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )
                    })()}
                  </div>

                  {/* Panel Legend */}
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Panel {currentPanel.label}</h4>
                    <p className="text-sm text-muted-foreground">{currentPanel.caption}</p>
                  </div>

                  {/* Panel Quality Checks */}
                  {currentPanel.check_results && currentPanel.check_results.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Panel Quality Checks</h4>
                      <div className="space-y-1">
                        {(currentPanel.check_results || []).map((check: any, index: number) => {

                          // Defensive check: ensure check is properly formatted
                          const safeCheck = typeof check === 'object' && check !== null ? {
                            id: check.id || `panel-check-${index}`,
                            type: check.type || 'info',
                            message: String(check.message || check.name || 'Check result'),
                            category: typeof check.category === 'object'
                              ? (check.category?.name || check.category?.type || 'Quality Check')
                              : String(check.category || 'Quality Check'),
                            severity: (['high', 'low', 'medium'].includes(check.severity) ? check.severity : 'medium') as 'high' | 'low' | 'medium'
                          } : {
                            id: `panel-check-${index}`,
                            type: 'info',
                            message: String(check) || 'Check result',
                            category: 'Quality Check',
                            severity: 'medium' as const
                          }
                          return (
                            <div key={getCheckId(check, 'panel', index)} className="flex items-center gap-2 text-sm">
                              {getCheckIcon(check)}
                              <span>{check.message || check.check_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {check.check_name}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">No panels available</p>
                    <p className="text-sm">This figure doesn't have any panels to display</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Figure Info Sidebar */}
        <div className="space-y-4">
          {/* Figure List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Figures</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {figures.map((figure, index) => (
                    <Button
                      key={figure.id}
                      variant={index === selectedFigureIndex ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => onFigureChange(index)}
                    >
                      <div className="truncate">
                        <div className="font-medium">Figure {figure.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {figure.caption}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Panel Navigation */}
          {currentFigure.panels && currentFigure.panels.length > 0 && (
            <Card className="gap-0">
              <CardHeader>
                <CardTitle className="text-base">Panels</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {currentFigure.panels.map((panel, index) => (
                    <Button
                      key={panel.id}
                      variant={index === selectedPanelIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPanelIndex(index)}
                      className="h-auto p-2"
                    >
                      <div className="text-center">
                        <div className="font-medium">Panel {panel.label}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Figure Quality Checks */}
          {currentFigure.check_results && currentFigure.check_results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Figure Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {((currentFigure as any).check_results || []).map((check: any, index: number) => {

                    // Defensive check: ensure check is properly formatted
                    const safeCheck = typeof check === 'object' && check !== null ? {
                      id: check.id || `figure-check-${index}`,
                      type: check.type || 'info',
                      message: String(check.message || check.name || 'Check result'),
                      category: String(check.category || 'Quality Check'),
                      severity: (['high', 'low', 'medium'].includes(check.severity) ? check.severity : 'medium') as 'high' | 'low' | 'medium',
                      details: String(check.details || 'No details available')
                    } : {
                      id: `figure-check-${index}`,
                      type: 'info',
                      message: String(check) || 'Check result',
                      category: 'Quality Check',
                      severity: 'medium' as const,
                      details: 'No details available'
                    }
                    return (
                      <TooltipProvider key={getCheckId(check, 'figure', index)}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 p-2 rounded border">
                              {getCheckIcon(check)}
                              <span className="text-sm flex-1">{check.message || check.check_name}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Check: {check.check_name}</p>
                            <p>Status: {check.status}</p>
                            {check.details && <p>{check.details}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
