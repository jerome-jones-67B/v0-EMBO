// Integration function to add real data to existing mock data

import { aiPromptRunner } from './ai-prompt-runner'

export interface RealFigureData {
  id: string
  title: string
  legend: string
  panels: {
    id: string
    description: string
    legend: string
    imagePath: string
    thumbnailPath: string
  }[]
  fullImagePath: string
  qcChecks: any[]
  prompts: any[]
}

// Load real data from API and add to existing mock data
export async function loadAndAddRealData(existingMockFigures: any[]): Promise<any[]> {
  try {
    console.log('Loading real data from API...')
    const response = await fetch('/api/real-data')
    if (!response.ok) {
      console.error('Failed to load real data:', response.status, response.statusText)
      return existingMockFigures
    }
    
    const data = await response.json()
    console.log('Real data loaded:', data)
    const realFigures = data.figures || []
    
    // Convert real figures to mock format and add to existing data
    const convertedFigures = await Promise.all(realFigures.map(async (realFigure: RealFigureData) => {
      // Run AI prompts on the real figure data
      const promptResults = await aiPromptRunner.runAllPromptsOnFigure(realFigure)
      const qcChecks = aiPromptRunner.convertPromptResultsToQCChecks(promptResults)
      
      return {
        id: realFigure.id,
        title: realFigure.title,
        legend: realFigure.legend,
        linkedData: [], // Start with empty linked data
        panels: realFigure.panels.map(panel => ({
          id: panel.id,
          description: panel.description,
          legend: panel.legend,
          hasIssues: qcChecks.some(check => check.panelId === panel.id && check.type === 'issue'),
          imagePath: panel.imagePath,
          thumbnailPath: panel.thumbnailPath
        })),
        qcChecks: qcChecks,
        fullImagePath: realFigure.fullImagePath
      }
    }))
    
    // Add converted figures to existing mock data
    // Note: Figures will be available in the figures list, but to see them in a manuscript,
    // you need to view a manuscript that has figures. The figures are added to the global figures list.
    return [...existingMockFigures, ...convertedFigures]
  } catch (error) {
    console.error('Error loading real data:', error)
    return existingMockFigures
  }
}

