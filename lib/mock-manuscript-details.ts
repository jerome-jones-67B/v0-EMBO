import type { ManuscriptDetailData, LinkedDataItem, SourceDataFile } from '@/types/manuscript-detail'

export const mockManuscriptDetails: ManuscriptDetailData = {
  id: "1",
  msid: "EMBO-2024-001",
  title: "Structural basis of ATP hydrolysis by the molecular chaperone Hsp70",
  authors: "Smith, J., Johnson, M., Williams, K.",
  receivedDate: "2024-01-15",
  doi: "10.15252/embj.2024001",
  accessionNumber: "PDB-8ABC",
  assignedTo: "Dr. Sarah Chen",
  status: "Under Review",
  priority: "high",
  notes: "High-priority manuscript with excellent figures. Structural data looks comprehensive.",
  lastModified: "2024-01-20T10:30:00Z",
  figures: [
    {
      id: "fig1",
      title: "Hsp70 ATPase Domain Structure",
      legend: "Crystal structure of the Hsp70 ATPase domain in complex with ATP. (A) Overall structure showing the two lobes. (B) Close-up view of the ATP-binding site. (C) Comparison with ADP-bound state.",
      panels: [
        {
          id: "fig1a",
          description: "Overall structure",
          legend: "Overall structure of Hsp70 ATPase domain showing nucleotide-binding domain (NBD) in blue and substrate-binding domain (SBD) in green.",
          imagePath: "/protein-structure-control.png",
          qualityChecks: [
            {
              id: "check1",
              type: "success",
              message: "Image resolution: 300 DPI ✓",
              severity: "low",
              category: "Technical Quality"
            },
            {
              id: "check2",
              type: "success",
              message: "File format: TIFF ✓",
              severity: "low",
              category: "Format"
            }
          ]
        },
        {
          id: "fig1b", 
          description: "ATP-binding site",
          legend: "Detailed view of the ATP-binding site showing key catalytic residues and metal coordination.",
          imagePath: "/atp-folding-cycle.png",
          qualityChecks: [
            {
              id: "check3",
              type: "warning",
              message: "Consider higher magnification for clarity",
              severity: "medium",
              category: "Scientific Content"
            }
          ]
        },
        {
          id: "fig1c",
          description: "Structural comparison", 
          legend: "Superposition of ATP-bound (blue) and ADP-bound (red) conformations highlighting conformational changes.",
          imagePath: "/protein-structures.png",
          qualityChecks: [
            {
              id: "check4",
              type: "success",
              message: "Color scheme appropriate for colorblind accessibility ✓",
              severity: "low",
              category: "Accessibility"
            }
          ]
        }
      ],
      qualityChecks: [
        {
          id: "figcheck1",
          type: "success",
          message: "All panels properly labeled ✓",
          severity: "low",
          category: "Figure Composition"
        }
      ]
    },
    {
      id: "fig2",
      title: "Protein Aggregation Kinetics",
      legend: "Time-course analysis of protein aggregation under heat shock conditions. Fluorescence microscopy images show aggregation at different time points.",
      panels: [
        {
          id: "fig2a",
          description: "0 hours",
          legend: "Control condition showing dispersed protein distribution.",
          imagePath: "/microscopy-0-hours.png",
          qualityChecks: [
            {
              id: "check5",
              type: "success",
              message: "Scale bar present ✓",
              severity: "low",
              category: "Technical Quality"
            }
          ]
        },
        {
          id: "fig2b",
          description: "2 hours",
          legend: "Early aggregation visible as small puncta (arrows).",
          imagePath: "/microscopy-two-hours.png", 
          qualityChecks: [
            {
              id: "check6",
              type: "warning",
              message: "Arrows could be more visible",
              severity: "medium",
              category: "Visual Clarity"
            }
          ]
        },
        {
          id: "fig2c",
          description: "6 hours", 
          legend: "Progressive aggregation with larger structures formed.",
          imagePath: "/microscopy-6-hours.png",
          qualityChecks: []
        },
        {
          id: "fig2d",
          description: "24 hours",
          legend: "Extensive aggregation throughout the cell.",
          imagePath: "/microscopy-24-hours.png",
          qualityChecks: []
        }
      ],
      qualityChecks: [
        {
          id: "figcheck2",
          type: "success", 
          message: "Time series clearly demonstrates progression ✓",
          severity: "low",
          category: "Scientific Content"
        }
      ]
    }
  ],
  qcChecks: [
    {
      id: "qc1",
      type: "success",
      message: "All required metadata fields completed ✓",
      severity: "low",
      category: "Metadata"
    },
    {
      id: "qc2",
      type: "success",
      message: "Ethics statement provided ✓", 
      severity: "low",
      category: "Compliance"
    },
    {
      id: "qc3",
      type: "warning",
      message: "Some statistical methods could be described in more detail",
      severity: "medium",
      category: "Methods"
    }
  ]
}

export const mockLinkedData: LinkedDataItem[] = [
  {
    id: '1',
    type: 'Database Entry',
    identifier: 'UniProt:P12345',
    url: 'https://www.uniprot.org/uniprot/P12345',
    description: 'Hsp70 protein sequence and annotations',
    isCustom: false
  },
  {
    id: '2',
    type: 'Structure',
    identifier: 'PDB:8ABC',
    url: 'https://www.rcsb.org/structure/8ABC',
    description: 'Crystal structure of Hsp70 ATPase domain',
    isCustom: false
  },
  {
    id: '3', 
    type: 'Dataset',
    identifier: 'GEO:GSE123456',
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456',
    description: 'RNA-seq data for heat shock response',
    isCustom: false
  }
]

export const mockSourceData: SourceDataFile[] = [
  {
    id: '1',
    type: 'Raw Data',
    name: 'western_blot_quantification.xlsx',
    size: '2.1 MB',
    url: '/api/files/western_blot_quantification.xlsx',
    description: 'Quantification data for all Western blot experiments'
  },
  {
    id: '2',
    type: 'Analysis Script',
    name: 'statistical_analysis.R', 
    size: '45 KB',
    url: '/api/files/statistical_analysis.R',
    description: 'R script used for statistical analysis and plotting'
  },
  {
    id: '3',
    type: 'Processed Data',
    name: 'aggregated_results.csv',
    size: '890 KB', 
    url: '/api/files/aggregated_results.csv',
    description: 'Processed and aggregated experimental results'
  }
]