// Data integration utilities for populating mock data with real figure data

export interface Check4VizData {
  type: "issue" | "suggestion";
  message: string;
  details?: string;
  prompt?: string;
  panelId?: string;
}

export interface RealFigureData {
  id: string;
  title: string;
  legend: string;
  panels: {
    id: string;
    description: string;
    legend: string;
    imagePath: string;
    checks: Check4VizData[];
  }[];
  linkedData?: any[];
}

// Convert check4viz data to our QC check format
export function convertCheck4VizToQCCheck(check: Check4VizData, panelId: string): any {
  return {
    id: `${panelId}-${check.type}-${Date.now()}`,
    type: check.type === "issue" ? "error" : "info",
    message: check.message,
    details: check.details || check.prompt,
    aiGenerated: true,
    dismissed: false,
    panelId: panelId,
    timestamp: new Date().toISOString(),
    prompt: check.prompt // Store the original prompt for reference
  };
}

// Convert real figure data to our mock figure format
export function convertRealFigureToMock(realFigure: RealFigureData): any {
  return {
    id: realFigure.id,
    title: realFigure.title,
    legend: realFigure.legend,
    linkedData: realFigure.linkedData || [],
    panels: realFigure.panels.map(panel => ({
      id: panel.id,
      description: panel.description,
      legend: panel.legend,
      hasIssues: panel.checks.some(check => check.type === "issue"),
      imagePath: panel.imagePath, // Store the image path
      checks: panel.checks.map(check => convertCheck4VizToQCCheck(check, panel.id))
    })),
    qcChecks: realFigure.panels.flatMap(panel => 
      panel.checks.map(check => convertCheck4VizToQCCheck(check, panel.id))
    )
  };
}

// Process and integrate real figure data into existing mock data
export function integrateRealFigureData(existingFigures: any[], realFigure: RealFigureData): any[] {
  const convertedFigure = convertRealFigureToMock(realFigure);
  
  // Replace existing figure with same ID or add new one
  const existingIndex = existingFigures.findIndex(fig => fig.id === realFigure.id);
  
  if (existingIndex >= 0) {
    existingFigures[existingIndex] = convertedFigure;
  } else {
    existingFigures.push(convertedFigure);
  }
  
  return existingFigures;
}

// Example usage function
export function createSampleRealFigureData(): RealFigureData {
  return {
    id: "fig1",
    title: "Figure 1: Protein folding dynamics under normal conditions",
    legend: "Fig. 1 Protein folding dynamics under normal conditions. (A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left. (B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm. (C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
    panels: [
      {
        id: "1A",
        description: "Western blot analysis of HSP70 expression",
        legend: "(A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left.",
        imagePath: "/western-blot-panel.png",
        checks: [
          {
            type: "issue",
            message: "Molecular weight markers not clearly labeled",
            details: "The molecular weight markers should be clearly labeled with their sizes in kDa",
            prompt: "Check if molecular weight markers are clearly labeled with their sizes in kDa. This is important for readers to understand the scale of the proteins being analyzed."
          },
          {
            type: "suggestion",
            message: "Consider adding loading control",
            details: "A loading control (e.g., actin or GAPDH) would help verify equal protein loading across lanes",
            prompt: "Suggest adding a loading control to verify equal protein loading across all lanes. This is a standard practice in western blot analysis."
          }
        ]
      },
      {
        id: "1B",
        description: "Fluorescence microscopy of protein aggregates",
        legend: "(B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm.",
        imagePath: "/microscopy-panel.png",
        checks: [
          {
            type: "issue",
            message: "Scale bar positioning could be improved",
            details: "The scale bar should be positioned in a corner and not overlap with important cellular structures",
            prompt: "Check the positioning of the scale bar. It should be clearly visible and not overlap with important cellular structures or data."
          },
          {
            type: "suggestion",
            message: "Consider adding magnification information",
            details: "Including the magnification (e.g., 40x, 63x) would provide additional context for readers",
            prompt: "Suggest adding magnification information to help readers understand the scale and resolution of the microscopy image."
          }
        ]
      },
      {
        id: "1C",
        description: "Quantitative analysis of folding rates",
        legend: "(C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
        imagePath: "/quantitative-panel.png",
        checks: [
          {
            type: "suggestion",
            message: "Statistical analysis appears appropriate",
            details: "Error bars represent SEM from n=3 independent experiments, which is good practice",
            prompt: "Verify that the statistical analysis is appropriate. SEM from n=3 experiments is a reasonable approach for this type of data."
          },
          {
            type: "suggestion",
            message: "Consider showing individual data points",
            details: "Showing individual data points along with the mean and error bars would provide more transparency",
            prompt: "Suggest showing individual data points along with the mean and error bars to provide more transparency about the data distribution."
          }
        ]
      }
    ]
  };
}
