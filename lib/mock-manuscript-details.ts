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
      id: 1,
      title: "Hsp70 ATPase Domain Structure",
      caption: "Crystal structure of the Hsp70 ATPase domain in complex with ATP. (A) Overall structure showing the two lobes. (B) Close-up view of the ATP-binding site. (C) Comparison with ADP-bound state.",
      panels: [
        {
          id: 1,
          label: "A",
          caption: "Overall structure of Hsp70 ATPase domain showing nucleotide-binding domain (NBD) in blue and substrate-binding domain (SBD) in green.",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.95,
          sort_order: 0,
          source_data: [],
          links: [],
          check_results: []
        },
        {
          id: 2,
          label: "B",
          caption: "Detailed view of the ATP-binding site showing key catalytic residues and metal coordination.",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.92,
          sort_order: 1,
          source_data: [],
          links: [],
          check_results: []
        },
        {
          id: 3,
          label: "C",
          caption: "Superposition of ATP-bound (blue) and ADP-bound (red) conformations highlighting conformational changes.",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.88,
          sort_order: 2,
          source_data: [],
          links: [],
          check_results: []
        }
      ],
      qualityChecks: [
        {
          id: "fig1-check1",
          type: "success",
          message: "All panels properly labeled ✓",
          severity: "low",
          category: "Figure Composition"
        }
      ]
    },
    {
      id: 2,
      title: "Protein Aggregation Kinetics",
      caption: "Time-course analysis of protein aggregation under heat shock conditions. Fluorescence microscopy images show aggregation at different time points.",
      panels: [
        {
          id: 4,
          label: "A",
          caption: "Control condition showing dispersed protein distribution.",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.90,
          sort_order: 0,
          source_data: [],
          links: [],
          check_results: []
        },
        {
          id: 5,
          label: "B",
          caption: "Early aggregation visible as small puncta (arrows).",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.85,
          sort_order: 1,
          source_data: [],
          links: [],
          check_results: []
        },
        {
          id: 6,
          label: "C",
          caption: "Progressive aggregation with larger structures formed.",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.88,
          sort_order: 2,
          source_data: [],
          links: [],
          check_results: []
        },
        {
          id: 7,
          label: "D",
          caption: "Extensive aggregation throughout the cell.",
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
          confidence: 0.92,
          sort_order: 3,
          source_data: [],
          links: [],
          check_results: []
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
    description: 'Quantification data for all Western blot experiments',
    mappedElements: ['fig1a', 'fig2a'],
    originalUri: '/data/raw/western_blot_quantification.xlsx'
  },
  {
    id: '2',
    type: 'Analysis Script',
    name: 'statistical_analysis.R', 
    size: '45 KB',
    url: '/api/files/statistical_analysis.R',
    description: 'R script used for statistical analysis and plotting',
    mappedElements: ['fig1', 'fig2'],
    originalUri: '/scripts/analysis/statistical_analysis.R'
  },
  {
    id: '3',
    type: 'Processed Data',
    name: 'aggregated_results.csv',
    size: '890 KB', 
    url: '/api/files/aggregated_results.csv',
    description: 'Processed and aggregated experimental results',
    mappedElements: ['manuscript'],
    originalUri: '/data/processed/aggregated_results.csv'
  },
  {
    id: '4',
    type: 'Figure Data',
    name: 'protein_structure_coordinates.pdb',
    size: '3.2 MB',
    url: '/api/files/protein_structure_coordinates.pdb',
    description: 'Protein structure coordinates for Figure 1',
    mappedElements: ['fig1b', 'fig1c'],
    originalUri: '/figures/structures/protein_structure_coordinates.pdb'
  },
  {
    id: '5',
    type: 'Raw Data',
    name: 'microscopy_images.zip',
    size: '156 MB',
    url: '/api/files/microscopy_images.zip',
    description: 'Raw microscopy images for time-course analysis',
    mappedElements: ['fig2b', 'fig2c', 'fig2d'],
    originalUri: '/data/microscopy/time_course/microscopy_images.zip'
  },
  {
    id: '6',
    type: 'Supplementary',
    name: 'additional_controls.xlsx',
    size: '1.8 MB',
    url: '/api/files/additional_controls.xlsx',
    description: 'Additional control experiments and validation data',
    mappedElements: [],
    originalUri: '/supplementary/controls/additional_controls.xlsx'
  }
]