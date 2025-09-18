/**
 * Unified figures data service that handles loading and transforming
 * figure data from different sources (API, real data, mock data)
 */

import { realFigures } from './real-figures-data';
import { transformApiFigureToUI } from './data-transformer';
import { config } from './config';

export interface FigureData {
  id: string;
  title: string;
  legend: string;
  panels: PanelData[];
  qcChecks: QCCheckData[];
  linkedData?: any[];
  fullImagePath?: string;
}

export interface PanelData {
  id: string;
  description: string;
  legend: string;
  hasIssues: boolean;
  imagePath?: string;
  thumbnailPath?: string;
}

export interface QCCheckData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'issue' | 'suggestion';
  message: string;
  details: string;
  aiGenerated: boolean;
  dismissed: boolean;
  panelId?: string;
  timestamp: string;
}

/**
 * Load figures for a manuscript from the appropriate data source
 */
export async function loadManuscriptFigures(
  manuscriptId: string,
  useApiData: boolean = false
): Promise<FigureData[]> {
  if (useApiData) {
    return await loadFiguresFromAPI(manuscriptId);
  } else {
    return loadFiguresFromMockData(manuscriptId);
  }
}

/**
 * Load figures from Data4Rev API
 */
async function loadFiguresFromAPI(manuscriptId: string): Promise<FigureData[]> {
  try {
    const response = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.DATA4REV_AUTH_TOKEN && {
            'Authorization': `Bearer ${process.env.DATA4REV_AUTH_TOKEN}`
          })
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to load manuscript from API: ${response.status}`);
      return loadFiguresFromMockData(manuscriptId);
    }

    const manuscriptData = await response.json();
    
    if (!manuscriptData.figures || manuscriptData.figures.length === 0) {
      console.warn('No figures found in API data, using mock data');
      return loadFiguresFromMockData(manuscriptId);
    }

    // Transform API figures to unified format
    return manuscriptData.figures.map((apiFigure: any) => transformApiFigureToUI(apiFigure));

  } catch (error) {
    console.error('Error loading figures from API:', error);
    return loadFiguresFromMockData(manuscriptId);
  }
}

/**
 * Load figures from mock/real data
 */
function loadFiguresFromMockData(manuscriptId: string): FigureData[] {
  // First try to find real figures data
  const realFigureData = realFigures.find(fig => 
    fig.id === `figure-${manuscriptId}` || 
    fig.id.includes(manuscriptId) ||
    manuscriptId.includes(fig.id.replace('figure-', ''))
  );

  if (realFigureData) {
    return [transformRealFigureToUnified(realFigureData)];
  }

  // Generate mock figures based on manuscript ID
  return generateMockFigures(manuscriptId);
}

/**
 * Transform real figure data to unified format
 */
function transformRealFigureToUnified(realFigure: any): FigureData {
  return {
    id: realFigure.id,
    title: realFigure.title,
    legend: realFigure.legend,
    fullImagePath: realFigure.fullImagePath,
    panels: realFigure.panels.map((panel: any) => ({
      id: panel.id,
      description: panel.description,
      legend: panel.legend,
      hasIssues: panel.hasIssues,
      imagePath: panel.imagePath,
      thumbnailPath: panel.thumbnailPath
    })),
    qcChecks: realFigure.qcChecks || [],
    linkedData: realFigure.linkedData || []
  };
}

/**
 * Generate mock figures for manuscripts without real data
 */
function generateMockFigures(manuscriptId: string): FigureData[] {
  const baseId = parseInt(manuscriptId.split('-')[2]) || 1;
  const figureCount = 1 + (baseId % 3); // 1-3 figures per manuscript
  const figures: FigureData[] = [];

  for (let i = 1; i <= figureCount; i++) {
    const panelCount = 2 + ((baseId + i) % 4); // 2-5 panels per figure
    const panels: PanelData[] = [];
    
    for (let j = 1; j <= panelCount; j++) {
      panels.push({
        id: `${i}${String.fromCharCode(64 + j)}`, // 1A, 1B, etc.
        description: `Panel ${i}${String.fromCharCode(64 + j)}: ${j === 1 ? 'Primary experimental data' : j === 2 ? 'Control conditions' : j === 3 ? 'Quantitative analysis' : j === 4 ? 'Statistical validation' : 'Supplementary results'}`,
        legend: `(${String.fromCharCode(64 + j)}) Detailed description of panel ${i}${String.fromCharCode(64 + j)}`,
        hasIssues: ((baseId + i + j) % 6) === 0 // Some panels have issues
      });
    }

    figures.push({
      id: `figure-${i}`,
      title: `Figure ${i}: Experimental Analysis`,
      legend: `Figure ${i}. Comprehensive experimental analysis showing various aspects of the research findings.`,
      panels,
      qcChecks: generateMockQCChecks(panels, baseId + i),
      linkedData: []
    });
  }

  return figures;
}

/**
 * Generate mock QC checks for figures
 */
function generateMockQCChecks(panels: PanelData[], seed: number): QCCheckData[] {
  const checks: QCCheckData[] = [];
  const checkTypes = ['issue', 'suggestion', 'info'] as const;
  const messages = [
    'Individual data points not shown on plot',
    'Statistical test not mentioned in caption',
    'Scale bar positioning could be improved',
    'Error bars not defined in caption',
    'Replicates not defined in caption',
    'Consider adding loading control',
    'Magnification information missing'
  ];

  panels.forEach((panel, index) => {
    const checkCount = 1 + ((seed + index) % 3); // 1-3 checks per panel
    
    for (let i = 0; i < checkCount; i++) {
      const typeIndex = (seed + index + i) % checkTypes.length;
      const messageIndex = (seed + index + i) % messages.length;
      
      checks.push({
        id: `${panel.id}-check-${i}`,
        type: checkTypes[typeIndex],
        message: messages[messageIndex],
        details: `Check details for panel ${panel.id}`,
        aiGenerated: true,
        dismissed: false,
        panelId: panel.id,
        timestamp: new Date().toISOString()
      });
    }
  });

  return checks;
}

/**
 * Get a single figure by ID
 */
export async function getFigureById(
  manuscriptId: string,
  figureId: string,
  useApiData: boolean = false
): Promise<FigureData | null> {
  const figures = await loadManuscriptFigures(manuscriptId, useApiData);
  return figures.find(figure => figure.id === figureId) || null;
}

/**
 * Update figure data (for editing functionality)
 */
export async function updateFigure(
  manuscriptId: string,
  figureId: string,
  updates: Partial<FigureData>,
  useApiData: boolean = false
): Promise<FigureData | null> {
  if (useApiData) {
    // In API mode, send updates to Data4Rev API
    try {
      const response = await fetch(
        `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.DATA4REV_AUTH_TOKEN && {
              'Authorization': `Bearer ${process.env.DATA4REV_AUTH_TOKEN}`
            })
          },
          body: JSON.stringify(updates)
        }
      );

      if (response.ok) {
        const updatedFigure = await response.json();
        return transformApiFigureToUI(updatedFigure);
      }
    } catch (error) {
      console.error('Error updating figure via API:', error);
    }
  }

  // For mock mode or API fallback, return updated mock data
  console.log(`Mock update for figure ${figureId}:`, updates);
  return null; // In a real implementation, this would update local storage or cache
}
