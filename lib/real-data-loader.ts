// Real data loader for processing actual figure data from the data-for-mock folder

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
}

export interface QualityCheckPrompt {
  id: string
  name: string
  description: string
  prompt: string
}

export interface ProcessedFigureData extends RealFigureData {
  qcChecks: any[]
  prompts: QualityCheckPrompt[]
}

// Load all figures from the API
export async function loadAllFigures(): Promise<ProcessedFigureData[]> {
  try {
    const response = await fetch('/api/real-data')
    if (!response.ok) {
      throw new Error('Failed to load real data')
    }
    
    const data = await response.json()
    return data.figures || []
  } catch (error) {
    console.error('Error loading figures:', error)
    return []
  }
}


// Convert real figure data to mock format
export function convertToMockFormat(realFigure: ProcessedFigureData): any {
  return {
    id: realFigure.id,
    title: realFigure.title,
    legend: realFigure.legend,
    linkedData: [],
    panels: realFigure.panels.map(panel => ({
      id: panel.id,
      description: panel.description,
      legend: panel.legend,
      hasIssues: false, // Will be determined by QC checks
      imagePath: panel.imagePath,
      thumbnailPath: panel.thumbnailPath
    })),
    qcChecks: realFigure.qcChecks,
    fullImagePath: realFigure.fullImagePath
  }
}

// Generate sample QC checks based on prompts
export function generateSampleQCChecks(realFigure: ProcessedFigureData): any[] {
  const checks: any[] = []
  
  // Generate checks for each panel and prompt combination
  realFigure.panels.forEach(panel => {
    realFigure.prompts.forEach(prompt => {
      // Create a sample check based on the prompt type
      const check = createSampleCheck(panel.id, prompt.id, prompt.name)
      if (check) {
        checks.push(check)
      }
    })
  })
  
  return checks
}

// Create a sample check based on prompt type
function createSampleCheck(panelId: string, promptId: string, promptName: string): any | null {
  const checkTypes: Record<string, { type: string; message: string; details: string }> = {
    'error-bars-defined': {
      type: 'suggestion',
      message: 'Error bars should be clearly defined in the caption',
      details: 'Check if error bars are present and properly explained in the figure legend'
    },
    'individual-data-points': {
      type: 'suggestion',
      message: 'Consider showing individual data points',
      details: 'Individual data points provide more transparency about data distribution'
    },
    'micrograph-scale-bar': {
      type: 'issue',
      message: 'Scale bar may be missing or unclear',
      details: 'Micrographs should include clearly labeled scale bars'
    },
    'replicates-defined': {
      type: 'suggestion',
      message: 'Replicate information should be clearly stated',
      details: 'The number and type of replicates should be explicitly mentioned'
    },
    'stat-test-mentioned': {
      type: 'suggestion',
      message: 'Statistical test should be mentioned if applicable',
      details: 'When statistical significance is indicated, the test used should be specified'
    }
  }
  
  const checkTemplate = checkTypes[promptId]
  if (!checkTemplate) return null
  
  return {
    id: `${panelId}-${promptId}-${Date.now()}`,
    type: checkTemplate.type,
    message: checkTemplate.message,
    details: checkTemplate.details,
    aiGenerated: true,
    dismissed: false,
    panelId: panelId,
    timestamp: new Date().toISOString(),
    promptId: promptId,
    promptName: promptName
  }
}
