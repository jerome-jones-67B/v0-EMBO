"use client"

import React, { useState } from 'react'
import RealDataManager from '@/components/real-data-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DataIntegrationPage() {
  const [integratedData, setIntegratedData] = useState<any[]>([])

  const handleDataUpdate = (newData: any) => {
    setIntegratedData(prev => [...prev, newData])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Data Integration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real Data Integration System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This tool loads your real figure data from the data-for-mock folder, processes the images, 
            captions, and quality check prompts, and integrates them into the manuscript review system.
          </p>
        </CardContent>
      </Card>

      <RealDataManager onDataUpdate={handleDataUpdate} />

      {integratedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Integrated Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {integratedData.length} figure(s) have been integrated with real data.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integratedData.map((figure, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">{figure.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          <strong>ID:</strong> {figure.id}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Panels:</strong> {figure.panels?.length || 0}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>QC Checks:</strong> {figure.qcChecks?.length || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
