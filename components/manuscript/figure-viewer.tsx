"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, AlertTriangle, CheckCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Figure, QualityCheck } from '@/types/manuscript-detail'

interface FigureViewerProps {
  figures: Figure[]
  selectedFigureIndex: number
  onFigureChange: (index: number) => void
  onNextFigure: () => void
  onPreviousFigure: () => void
}

export function FigureViewer({
  figures,
  selectedFigureIndex,
  onFigureChange,
  onNextFigure,
  onPreviousFigure
}: FigureViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedPanelIndex, setSelectedPanelIndex] = useState(0)

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

  const getCheckIcon = (check: QualityCheck) => {
    switch (check.type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getCheckId = (check: QualityCheck, type: string, index: number) => {
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
              <CardTitle className="text-lg">{currentFigure.title}</CardTitle>
              <CardDescription>{currentFigure.legend}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPanel ? (
                <div className="space-y-4">
                  <div className="relative overflow-auto border rounded-lg">
                    <Image
                      src={currentPanel.imagePath}
                      alt={currentPanel.description}
                      width={600}
                      height={400}
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top left',
                        maxWidth: 'none'
                      }}
                      className="transition-transform duration-200"
                    />
                  </div>
                  
                  {/* Panel Legend */}
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-1">Panel {currentPanel.description}</h4>
                    <p className="text-sm text-muted-foreground">{currentPanel.legend}</p>
                  </div>

                  {/* Panel Quality Checks */}
                  {currentPanel.qualityChecks && currentPanel.qualityChecks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Panel Quality Checks</h4>
                      <div className="space-y-1">
                        {currentPanel.qualityChecks.map((check, index) => (
                          <div key={getCheckId(check, 'panel', index)} className="flex items-center gap-2 text-sm">
                            {getCheckIcon(check)}
                            <span>{check.message}</span>
                            <Badge variant="outline" className="text-xs">
                              {check.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No panels available for this figure
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
                        <div className="font-medium">Figure {index + 1}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {figure.title}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Panels</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <div className="font-medium">{panel.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Figure Quality Checks */}
          {currentFigure.qualityChecks && currentFigure.qualityChecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Figure Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentFigure.qualityChecks.map((check, index) => (
                    <TooltipProvider key={getCheckId(check, 'figure', index)}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 p-2 rounded border">
                            {getCheckIcon(check)}
                            <span className="text-sm flex-1">{check.message}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Category: {check.category}</p>
                          <p>Severity: {check.severity}</p>
                          {check.details && <p>{check.details}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}