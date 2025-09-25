// Data loader for processing check4viz.json files and integrating real figure data

import { RealFigureData, integrateRealFigureData, convertCheck4VizToQCCheck, Check4VizData } from './data-integration';

// Load and process check4viz.json data
export async function loadCheck4VizData(filePath: string): Promise<Check4VizData[]> {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading check4viz data:', error);
    return [];
  }
}

// Process check4viz data and create figure data
export function processCheck4VizData(
  checkData: Check4VizData[],
  figureId: string,
  figureTitle: string,
  figureLegend: string,
  panels: {
    id: string;
    description: string;
    legend: string;
    imagePath: string;
  }[]
): RealFigureData {
  // Group checks by panel ID
  const checksByPanel = checkData.reduce((acc, check) => {
    const panelId = check.panelId || 'general';
    if (!acc[panelId]) {
      acc[panelId] = [];
    }
    acc[panelId].push(check);
    return acc;
  }, {} as Record<string, Check4VizData[]>);

  return {
    id: figureId,
    title: figureTitle,
    legend: figureLegend,
    panels: panels.map(panel => ({
      ...panel,
      checks: checksByPanel[panel.id] || []
    }))
  };
}

// Load figure images and create thumbnails
export function loadFigureImages(figureData: RealFigureData): Promise<RealFigureData> {
  return new Promise((resolve) => {
    // In a real implementation, you would load and process images here
    // For now, we'll just return the data as-is
    resolve(figureData);
  });
}

// Main function to load and integrate real figure data
export async function loadAndIntegrateRealFigureData(
  check4VizPath: string,
  figureId: string,
  figureTitle: string,
  figureLegend: string,
  panels: {
    id: string;
    description: string;
    legend: string;
    imagePath: string;
  }[],
  existingFigures: any[]
): Promise<any[]> {
  try {
    // Load check4viz data
    const checkData = await loadCheck4VizData(check4VizPath);
    
    // Process the data
    const realFigureData = processCheck4VizData(
      checkData,
      figureId,
      figureTitle,
      figureLegend,
      panels
    );
    
    // Load images
    const figureWithImages = await loadFigureImages(realFigureData);
    
    // Integrate with existing data
    return integrateRealFigureData(existingFigures, figureWithImages);
  } catch (error) {
    console.error('Error loading and integrating real figure data:', error);
    return existingFigures;
  }
}

// Utility function to create a data integration workflow
export function createDataIntegrationWorkflow() {
  return {
    // Step 1: Load check4viz.json
    loadCheck4Viz: (filePath: string) => loadCheck4VizData(filePath),
    
    // Step 2: Process and create figure data
    processFigure: (checkData: Check4VizData[], figureInfo: any) => 
      processCheck4VizData(checkData, figureInfo.id, figureInfo.title, figureInfo.legend, figureInfo.panels),
    
    // Step 3: Integrate with existing data
    integrate: (realFigure: RealFigureData, existingFigures: any[]) => 
      integrateRealFigureData(existingFigures, realFigure),
    
    // Complete workflow
    loadAndIntegrate: loadAndIntegrateRealFigureData
  };
}

// Example usage for your specific data
export const exampleFigure1Data = {
  id: "fig1",
  title: "Figure 1: Protein folding dynamics under normal conditions",
  legend: "Fig. 1 Protein folding dynamics under normal conditions. (A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left. (B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm. (C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
  panels: [
    {
      id: "1A",
      description: "Western blot analysis of HSP70 expression",
      legend: "(A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left.",
      imagePath: "/western-blot-panel.png"
    },
    {
      id: "1B", 
      description: "Fluorescence microscopy of protein aggregates",
      legend: "(B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm.",
      imagePath: "/microscopy-panel.png"
    },
    {
      id: "1C",
      description: "Quantitative analysis of folding rates", 
      legend: "(C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
      imagePath: "/quantitative-panel.png"
    }
  ]
};

export const exampleFigure2Data = {
  id: "fig2",
  title: "Figure 2: UTP binding analysis",
  legend: "Fig. 2 UTP binding analysis. (A) Crystal structure of the UTP binding site. (B) Binding affinity measurements showing concentration-dependent binding.",
  panels: [
    {
      id: "2A",
      description: "Crystal structure of UTP binding site",
      legend: "(A) Crystal structure of the UTP binding site showing key residues.",
      imagePath: "/crystal-structure-panel.png"
    },
    {
      id: "2B",
      description: "Binding affinity measurements",
      legend: "(B) Binding affinity measurements showing concentration-dependent binding.",
      imagePath: "/binding-affinity-panel.png"
    }
  ]
};
