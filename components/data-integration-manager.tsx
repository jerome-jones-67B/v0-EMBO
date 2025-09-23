"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Cpu,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { 
  loadAndIntegrateRealFigureData, 
  createDataIntegrationWorkflow,
  exampleFigure1Data,
  exampleFigure2Data
} from '@/lib/data-loader'
import { Check4VizData, RealFigureData } from '@/lib/data-integration'

interface DataIntegrationManagerProps {
  onDataUpdate?: (newData: any[]) => void
}

export default function DataIntegrationManager({ onDataUpdate }: DataIntegrationManagerProps) {
  const [check4VizData, setCheck4VizData] = useState<Check4VizData[]>([])
  const [figureData, setFigureData] = useState<RealFigureData | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for manual data entry
  const [figureForm, setFigureForm] = useState({
    id: '',
    title: '',
    legend: '',
    panels: [] as Array<{
      id: string
      description: string
      legend: string
      imagePath: string
    }>
  })

  const [checkForm, setCheckForm] = useState({
    type: 'issue' as 'issue' | 'suggestion',
    message: '',
    details: '',
    prompt: '',
    panelId: ''
  })

  const workflow = createDataIntegrationWorkflow()

  // Load example data
  const loadExampleData = async (figureType: 'fig1' | 'fig2') => {
    setIsLoading(true)
    setError(null)
    
    try {
      const exampleData = figureType === 'fig1' ? exampleFigure1Data : exampleFigure2Data
      
      // Simulate loading check4viz data
      const mockCheckData: Check4VizData[] = [
        {
          type: 'issue',
          message: 'Molecular weight markers not clearly labeled',
          details: 'The molecular weight markers should be clearly labeled with their sizes in kDa',
          prompt: 'Check if molecular weight markers are clearly labeled with their sizes in kDa.',
          panelId: '1A'
        },
        {
          type: 'suggestion',
          message: 'Consider adding loading control',
          details: 'A loading control would help verify equal protein loading',
          prompt: 'Suggest adding a loading control to verify equal protein loading.',
          panelId: '1A'
        }
      ]
      
      setCheck4VizData(mockCheckData)
      const exampleDataWithChecks = {
        ...exampleData,
        panels: exampleData.panels.map(panel => ({
          ...panel,
          checks: [] as any[]
        }))
      }
      setFigureData(exampleDataWithChecks)
      
      // Process the data
      const processedData = workflow.processFigure(mockCheckData, exampleData)
      setPreviewData(processedData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load example data')
    } finally {
      setIsLoading(false)
    }
  }

  // Add new panel
  const addPanel = () => {
    setFigureForm(prev => ({
      ...prev,
      panels: [...prev.panels, {
        id: '',
        description: '',
        legend: '',
        imagePath: ''
      }]
    }))
  }

  // Add new check
  const addCheck = () => {
    if (!checkForm.message.trim()) return
    
    const newCheck: Check4VizData = {
      type: checkForm.type,
      message: checkForm.message,
      details: checkForm.details,
      prompt: checkForm.prompt,
      panelId: checkForm.panelId
    }
    
    setCheck4VizData(prev => [...prev, newCheck])
    setCheckForm({
      type: 'issue',
      message: '',
      details: '',
      prompt: '',
      panelId: ''
    })
  }

  // Process and preview data
  const processData = () => {
    if (!figureData || check4VizData.length === 0) return
    
    const processedData = workflow.processFigure(check4VizData, figureData)
    setPreviewData(processedData)
  }

  // Get check icon
  const getCheckIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'suggestion':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Data Integration Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="load" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="load">Load Data</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="integrate">Integrate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="load" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => loadExampleData('fig1')}
                  disabled={isLoading}
                  className="w-full"
                >
                  Load Example Figure 1
                </Button>
                <Button 
                  onClick={() => loadExampleData('fig2')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Load Example Figure 2
                </Button>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              
              {figureData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Figure Data</h3>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p><strong>ID:</strong> {figureData.id}</p>
                    <p><strong>Title:</strong> {figureData.title}</p>
                    <p><strong>Panels:</strong> {figureData.panels.length}</p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              {previewData ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preview Processed Data</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewData.panels.map((panel: any) => (
                      <Card key={panel.id}>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Panel {panel.id}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-2">{panel.description}</p>
                          <div className="space-y-2">
                            {panel.checks.map((check: any, index: number) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                {getCheckIcon(check.type)}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{check.message}</p>
                                  {check.details && (
                                    <p className="text-xs text-gray-600">{check.details}</p>
                                  )}
                                </div>
                                <Badge variant={check.type === 'issue' ? 'destructive' : 'secondary'}>
                                  {check.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No data to preview. Load some data first.</p>
              )}
            </TabsContent>
            
            <TabsContent value="integrate" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Integration Status</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-md">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Figure Data</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {figureData ? '1' : '0'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-md">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">AI Checks</p>
                    <p className="text-2xl font-bold text-green-600">
                      {check4VizData.length}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-md">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Panels</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {figureData?.panels.length || 0}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={processData}
                  disabled={!figureData || check4VizData.length === 0}
                  className="w-full"
                >
                  Process and Preview Data
                </Button>
                
                {previewData && (
                  <Button 
                    onClick={() => onDataUpdate?.(previewData)}
                    className="w-full"
                    variant="outline"
                  >
                    Integrate with Mock Data
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
