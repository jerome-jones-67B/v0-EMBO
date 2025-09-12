export const mockFigures = [
  {
    id: "fig1",
    title: "Figure 1: Protein folding dynamics under normal conditions",
    legend:
      "Fig. 1 Protein folding dynamics under normal conditions. (A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left. (B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm. (C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
    linkedData: [
      {
        type: "GEO",
        identifier: "GSE123456",
        url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456",
        description: "RNA-seq data for protein folding study",
      },
    ],
    panels: [
      {
        id: "1A",
        description: "Western blot analysis of HSP70 expression",
        legend:
          "(A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left.",
        hasIssues: false,
      },
      {
        id: "1B",
        description: "Fluorescence microscopy of protein aggregates",
        legend:
          "(B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm.",
        hasIssues: true,
      },
      {
        id: "1C",
        description: "Quantitative analysis of folding rates",
        legend:
          "(C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
        hasIssues: false,
      },
    ],
    qcChecks: [
      {
        type: "info",
        message: "Statistical analysis appears appropriate",
        details: "Error bars represent SEM from n=3 independent experiments",
        aiGenerated: true,
        dismissed: false,
      },
      {
        type: "warning",
        message: "Plot shows individual data points and average values",
        details: "Good practice to show both individual measurements and summary statistics",
        aiGenerated: true,
        dismissed: false,
      },
      {
        type: "warning",
        message: "Error bars appear in the panel but are not defined in the caption",
        details: "Panel C shows error bars but the figure legend does not specify what they represent",
        aiGenerated: true,
        dismissed: false,
      },
    ],
  },
  {
    id: "fig2",
    title: "Figure 2: UTP binding to uncoupling protein 1",
    legend:
      "Fig. 2 UTP binding to uncoupling protein 1. (A) Structure of UCP1 with bound UTP (green) and three cardiolipin molecules (wheat). Core elements 1, 2, and 3 are coloured by domain in blue, yellow, and red, respectively, and the gate elements in grey. (B) UTP binding site. Residues are coloured by function: matrix network residues are shown in blue, arginine triplet residues are shown in black, and other residues involved in binding are shown in grey. Ionic interactions are shown with green broken lines, hydrogen bonds with black broken lines and the cation-π interaction with purple broken line.",
    linkedData: [],
    panels: [
      {
        id: "2A",
        description: "Heat map of gene expression changes",
        legend:
          "(A) Structure of UCP1 with bound UTP (green) and three cardiolipin molecules (wheat). Core elements 1, 2, and 3 are coloured by domain in blue, yellow, and red, respectively, and the gate elements in grey.",
        hasIssues: false,
      },
      {
        id: "2B",
        description: "Pathway analysis diagram",
        legend:
          "(B) UTP binding site. Residues are coloured by function: matrix network residues are shown in blue, arginine triplet residues are shown in black, and other residues involved in binding are shown in grey. Ionic interactions are shown with green broken lines, hydrogen bonds with black broken lines and the cation-π interaction with purple broken line.",
        hasIssues: false,
      },
    ],
    qcChecks: [
      {
        type: "warning",
        message: "Color scheme may not be colorblind-friendly",
        details: "Consider using colorblind-safe palette for heat map",
        aiGenerated: true,
        dismissed: false,
      },
      {
        type: "warning",
        message: "A scale bar is missing",
        details: "Panel A would benefit from a scale bar to indicate relative expression levels",
        aiGenerated: true,
        dismissed: false,
      },
      {
        type: "info",
        message: "Statistical significance indicators are clearly marked",
        details: "Appropriate use of asterisks to denote p-values in pathway diagram",
        aiGenerated: true,
        dismissed: false,
      },
    ],
  },
  {
    id: "fig3",
    title: "Figure 3: Molecular chaperone interactions",
    legend:
      "Fig. 3 Molecular chaperone interactions. (A) Co-immunoprecipitation results showing HSP70 binding partners. Input and immunoprecipitated samples are shown with molecular weight markers. (B) Protein-protein interaction network derived from mass spectrometry analysis. Node size represents interaction confidence. (C) Structural modeling of HSP70-cochaperone complexes based on crystal structures. (D) Binding affinity measurements using surface plasmon resonance. (E) Kinetic analysis of chaperone-substrate interactions measured by fluorescence anisotropy.",
    linkedData: [
      {
        type: "PDB",
        identifier: "7ABC",
        url: "https://www.rcsb.org/structure/7ABC",
        description: "Crystal structure of HSP70 complex",
      },
      {
        type: "UniProt",
        identifier: "P08107",
        url: "https://www.uniprot.org/uniprot/P08107",
        description: "Heat shock 70 kDa protein 1A",
      },
    ],
    panels: [
      {
        id: "3A",
        description: "Co-immunoprecipitation results",
        legend:
          "(A) Co-immunoprecipitation results showing HSP70 binding partners. Input and immunoprecipitated samples are shown with molecular weight markers.",
        hasIssues: false,
      },
      {
        id: "3B",
        description: "Protein-protein interaction network",
        legend:
          "(B) Protein-protein interaction network derived from mass spectrometry analysis. Node size represents interaction confidence.",
        hasIssues: false,
      },
      {
        id: "3C",
        description: "Structural modeling of complexes",
        legend: "(C) Structural modeling of HSP70-cochaperone complexes based on crystal structures.",
        hasIssues: true,
      },
      {
        id: "3D",
        description: "Binding affinity measurements",
        legend: "(D) Binding affinity measurements using surface plasmon resonance.",
        hasIssues: true,
      },
      {
        id: "3E",
        description: "Kinetic analysis of interactions",
        legend: "(E) Kinetic analysis of chaperone-substrate interactions measured by fluorescence anisotropy.",
        hasIssues: true,
      },
    ],
    qcChecks: [
      {
        type: "error",
        message: "Missing figure legend for panels C-E",
        details: "Figure 3 panels C, D, and E lack proper legends describing the experimental conditions.",
        aiGenerated: false,
        dismissed: false,
      },
      {
        type: "error",
        message: "Panels 1–2 in Figure 3 are missing image files",
        details: "Panel 3C and 3D image files could not be located in the submission package",
        aiGenerated: false,
        dismissed: false,
      },
      {
        type: "warning",
        message: "Molecular weight markers not clearly visible",
        details: "Panel A western blot would benefit from clearer molecular weight ladder labels",
        aiGenerated: true,
        dismissed: false,
      },
      {
        type: "info",
        message: "Appropriate controls included in experimental design",
        details: "Negative controls are present in co-immunoprecipitation experiments",
        aiGenerated: true,
        dismissed: false,
      },
    ],
  },
  {
    id: "fig4",
    title: "Figure 4: Time-course analysis of protein degradation",
    legend:
      "Fig. 4 Time-course analysis of protein degradation. (A) Cycloheximide chase experiment showing protein stability over time. Cells were treated with cycloheximide and harvested at indicated time points. (B) Quantification of protein levels normalized to loading control. Data represent mean ± SEM from three independent experiments.",
    linkedData: [],
    panels: [
      {
        id: "4A",
        description: "Cycloheximide chase experiment",
        legend:
          "(A) Cycloheximide chase experiment showing protein stability over time. Cells were treated with cycloheximide and harvested at indicated time points.",
        hasIssues: true,
      },
      {
        id: "4B",
        description: "Quantification of protein levels",
        legend:
          "(B) Quantification of protein levels normalized to loading control. Data represent mean ± SEM from three independent experiments.",
        hasIssues: false,
      },
    ],
    qcChecks: [
      {
        type: "error",
        message: "Figure 4 is missing",
        details: "Referenced figure file could not be found in the submission package",
        aiGenerated: false,
        dismissed: false,
      },
      {
        type: "warning",
        message: "Time points should be more clearly labeled",
        details: "Consider using consistent time interval labeling across all panels",
        aiGenerated: true,
        dismissed: false,
      },
    ],
  },
]

export const mockLinkedData = [
  {
    type: "PDB",
    identifier: "7ABC",
    url: "https://www.rcsb.org/structure/7ABC",
    description: "Crystal structure of HSP70 complex",
  },
  {
    type: "UniProt",
    identifier: "P08107",
    url: "https://www.uniprot.org/uniprot/P08107",
    description: "Heat shock 70 kDa protein 1A",
  },
  {
    type: "GEO",
    identifier: "GSE123456",
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456",
    description: "RNA-seq data under oxidative stress",
  },
]

export const mockSourceData = [
  {
    name: "supplementary_data.xlsx",
    filename: "supplementary_data.xlsx",
    url: "/files/supplementary_data.xlsx",
  },
  {
    name: "raw_data.csv",
    filename: "raw_data.csv",
    url: "/files/raw_data.csv",
  },
  {
    name: "analysis_scripts.zip",
    filename: "analysis_scripts.zip",
    url: "/files/analysis_scripts.zip",
  },
]

export const mockManuscripts = [
  {
    id: "EMBO-2024-001",
    title: "Molecular mechanisms of DNA repair in cancer cells",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez"],
    received: "2024-01-15",
    lastModified: "2024-01-20",
    status: "In progress", // Updated status to match allowed values
    assignedTo: "Dr. Sarah Wilson",
    priority: "high",
    figureCount: 4,
    qcStatus: "needs-validation",
  },
  {
    id: "EMBO-2024-002",
    title: "CRISPR-Cas9 mediated gene editing in stem cells",
    authors: ["Dr. Lisa Wang", "Dr. James Thompson"],
    received: "2024-01-12",
    lastModified: "2024-01-18",
    status: "On hold", // Updated status to match allowed values
    assignedTo: "Dr. Emily Davis",
    priority: "medium",
    figureCount: 6,
    qcStatus: "validated",
  },
  {
    id: "EMBO-2024-003",
    title: "Heat shock protein dynamics in cellular stress",
    authors: ["Dr. Robert Kim", "Dr. Maria Garcia"],
    received: "2024-01-10",
    lastModified: "2024-01-16",
    status: "Deposited", // Updated status to match allowed values
    assignedTo: "Dr. Sarah Wilson",
    priority: "low",
    figureCount: 3,
    qcStatus: "validated",
  },
  {
    id: "EMBO-2024-004",
    title: "Mitochondrial biogenesis and cellular metabolism",
    authors: ["Dr. Anna Petrov", "Dr. David Lee"],
    received: "2024-01-08",
    lastModified: "2024-01-14",
    status: "New submission", // Updated status to match allowed values
    assignedTo: null,
    priority: "medium",
    figureCount: 5,
    qcStatus: "needs-validation",
  },
  {
    id: "EMBO-2024-005",
    title: "Epigenetic regulation of gene expression",
    authors: ["Dr. Sophie Martin", "Dr. Alex Johnson"],
    received: "2024-01-05",
    lastModified: "2024-01-12",
    status: "Failed to deposit", // Updated status to match allowed values
    assignedTo: "Dr. Emily Davis",
    priority: "urgent",
    figureCount: 7,
    qcStatus: "validated",
  },
  {
    id: "EMBO-2024-006",
    title: "Protein folding mechanisms in disease",
    authors: ["Dr. Thomas Brown", "Dr. Jennifer White"],
    received: "2024-01-03",
    lastModified: "2024-01-10",
    status: "Waiting for data", // Updated status to match allowed values
    assignedTo: "Dr. Sarah Wilson",
    priority: "high",
    figureCount: 4,
    qcStatus: "needs-validation",
  },
]
