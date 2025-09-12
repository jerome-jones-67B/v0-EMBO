import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const dataPath = 'C:\\Source Code\\embo-data-for-mock\\data-for-mock'
    console.log('Loading real data from:', dataPath)
    
    // Check if the data path exists
    try {
      await fs.access(dataPath)
      console.log('Data path exists')
    } catch (error) {
      console.error('Data path does not exist:', dataPath)
      return NextResponse.json({ error: 'Data path does not exist', path: dataPath }, { status: 404 })
    }
    
    const figures = []
    
    // Load Figure 1
    console.log('Loading Figure 1...')
    const figure1 = await loadFigure('figure 1', 'Figure 1: Intestinal adenoma formation study', dataPath)
    if (figure1) {
      console.log('Figure 1 loaded successfully')
      figures.push(figure1)
    } else {
      console.log('Figure 1 failed to load')
    }
    
    // Load Figure 2
    console.log('Loading Figure 2...')
    const figure2 = await loadFigure('figure 2', 'Figure 2: MeCP2 and HIPK2 apoptosis study', dataPath)
    if (figure2) {
      console.log('Figure 2 loaded successfully')
      figures.push(figure2)
    } else {
      console.log('Figure 2 failed to load')
    }
    
    console.log('Total figures loaded:', figures.length)
    return NextResponse.json({ figures })
  } catch (error) {
    console.error('Error loading real data:', error)
    return NextResponse.json({ error: 'Failed to load real data', details: error.message }, { status: 500 })
  }
}

async function loadFigure(figureFolder: string, title: string, dataPath: string) {
  try {
    const figurePath = path.join(dataPath, figureFolder)
    const contentPath = path.join(figurePath, 'content')
    
    // Load caption
    const captionPath = path.join(contentPath, 'caption.txt')
    const legend = await fs.readFile(captionPath, 'utf-8')
    
    // Load full image
    const fullImageFiles = await fs.readdir(contentPath)
    const fullImageFile = fullImageFiles.find(file => file.endsWith('.jpg'))
    const fullImagePath = fullImageFile ? path.join(contentPath, fullImageFile) : ''
    
    // Load panel thumbnails
    const thumbnailsPath = path.join(contentPath, 'thumbnails')
    const thumbnailFiles = await fs.readdir(thumbnailsPath)
    const panelImages = thumbnailFiles
      .filter(file => file.endsWith('.png') && file !== '.DS_Store')
      .sort()
    
    // Create panels
    const panels = panelImages.map((imageFile, index) => {
      const panelId = String.fromCharCode(65 + index) // A, B, C, etc.
      return {
        id: panelId,
        description: `Panel ${panelId}`,
        legend: extractPanelLegend(legend, panelId),
        imagePath: `/api/real-data/image?figure=${figureFolder}&panel=${imageFile}`,
        thumbnailPath: `/api/real-data/image?figure=${figureFolder}&panel=${imageFile}`
      }
    })
    
    // Load quality check prompts
    const prompts = await loadQualityCheckPrompts(dataPath)
    
    return {
      id: figureFolder.replace(' ', '-'),
      title,
      legend,
      panels,
      fullImagePath: fullImageFile ? `/api/real-data/image?figure=${figureFolder}&full=${fullImageFile}` : '',
      qcChecks: [],
      prompts
    }
  } catch (error) {
    console.error(`Error loading figure ${figureFolder}:`, error)
    return null
  }
}

function extractPanelLegend(fullLegend: string, panelId: string): string {
  const panelPattern = new RegExp(`\\(${panelId}\\)[^)]*\\)`, 'g')
  const match = fullLegend.match(panelPattern)
  return match ? match[0] : `Panel ${panelId}`
}

async function loadQualityCheckPrompts(dataPath: string) {
  const promptsPath = path.join(dataPath, 'prompts', 'fig-checklist')
  const prompts = []
  
  try {
    const promptFolders = await fs.readdir(promptsPath)
    
    for (const folder of promptFolders) {
      if (folder.startsWith('.')) continue
      
      const folderPath = path.join(promptsPath, folder)
      const files = await fs.readdir(folderPath)
      
      // Find the prompt file (prompt.txt, prompt.2.txt, etc.)
      const promptFile = files.find(file => file.startsWith('prompt') && file.endsWith('.txt'))
      
      if (promptFile) {
        const promptPath = path.join(folderPath, promptFile)
        const promptContent = await fs.readFile(promptPath, 'utf-8')
        
        prompts.push({
          id: folder,
          name: folder.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: getPromptDescription(folder),
          prompt: promptContent
        })
      }
    }
    
    return prompts
  } catch (error) {
    console.error('Error loading prompts:', error)
    return []
  }
}

function getPromptDescription(promptId: string): string {
  const descriptions: Record<string, string> = {
    'error-bars-defined': 'Checks for error bars and their definition in captions',
    'individual-data-points': 'Checks if plots show individual data points',
    'micrograph-scale-bar': 'Checks for scale bars on micrographs',
    'replicates-defined': 'Checks for replicate definitions in captions',
    'stat-test-mentioned': 'Checks for statistical test mentions'
  }
  return descriptions[promptId] || 'Quality check prompt'
}
