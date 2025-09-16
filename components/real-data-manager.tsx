"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Info,
  Cpu,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { 
  loadAllFigures, 
  convertToMockFormat, 
  generateSampleQCChecks,
  ProcessedFigureData 
} from '../lib/real-data-loader'

interface RealDataManagerProps {
  onDataUpdate?: (newData: any[]) => void
}

export default function RealDataManager({ onDataUpdate }: RealDataManagerProps) {
  const [figures, setFigures] = useState<ProcessedFigureData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFigure, setSelectedFigure] = useState<ProcessedFigureData | null>(null)

  // Load all figures from the real data folder
  const loadRealData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const loadedFigures = await loadAllFigures()
      setFigures(loadedFigures)
      
      if (loadedFigures.length > 0) {
        setSelectedFigure(loadedFigures[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load real data')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate QC checks for a figure
  const generateQCChecks = (figure: ProcessedFigureData) => {
    const checks = generateSampleQCChecks(figure)
    const updatedFigure = { ...figure, qcChecks: checks }
    
    setFigures(prev => 
      prev.map(f => f.id === figure.id ? updatedFigure : f)
    )
    
    if (selectedFigure?.id === figure.id) {
      setSelectedFigure(updatedFigure)
    }
  }

  // Convert figure to mock format and integrate
  const integrateFigure = (figure: ProcessedFigureData) => {
    const mockFigure = convertToMockFormat(figure)
    onDataUpdate?.([mockFigure])
  }

  // Get check icon
  const getCheckIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadRealData()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Real Data Integration Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={loadRealData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Load Real Data
              </Button>
              
              <div className="text-sm text-gray-600">
                {figures.length} figure(s) loaded
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {figures.length > 0 && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="integrate">Integrate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {figures.map((figure) => (
                <Card key={figure.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      {figure.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Panels:</strong> {figure.panels.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Prompts:</strong> {figure.prompts.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>QC Checks:</strong> {figure.qcChecks.length}
                      </p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedFigure(figure)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateQCChecks(figure)}
                        >
                          <Cpu className="w-4 h-4 mr-2" />
                          Generate QC
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {selectedFigure ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedFigure.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{selectedFigure.legend}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedFigure.panels.map((panel) => (
                        <Card key={panel.id}>
                          <CardHeader>
                            <CardTitle className="text-sm">Panel {panel.id}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-gray-600 mb-2">{panel.description}</p>
                            <p className="text-xs text-gray-500">{panel.legend}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Check Prompts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFigure.prompts.map((prompt) => (
                        <div key={prompt.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{prompt.name}</p>
                            <p className="text-xs text-gray-600">{prompt.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-gray-500">Select a figure to view details</p>
            )}
          </TabsContent>
          
          <TabsContent value="integrate" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Integration Status</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-md">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Figures</p>
                  <p className="text-2xl font-bold text-blue-600">{figures.length}</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-md">
                  <Cpu className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Prompts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {figures.reduce((sum, fig) => sum + fig.prompts.length, 0)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-md">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Panels</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {figures.reduce((sum, fig) => sum + fig.panels.length, 0)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {figures.map((figure) => (
                  <div key={figure.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">{figure.title}</p>
                      <p className="text-sm text-gray-600">
                        {figure.panels.length} panels, {figure.qcChecks.length} QC checks
                      </p>
                    </div>
                    <Button 
                      onClick={() => integrateFigure(figure)}
                      size="sm"
                    >
                      Integrate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
