"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Plus,
  Upload,
  X,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  AlertCircle,
  Info,
  Link,
  Database,
  LucideEye,
  Edit2,
  Check,
  RotateCcw,
  ZoomIn,
  ChevronUp,
  ChevronDown,
  Download,
  Cpu,
} from "lucide-react"
import { mockLinkedData, mockSourceData } from "@/lib/mock"
import { dataService } from "@/lib/data-service"
import { getStatusMapping } from "@/lib/status-mapping"
import { transformApiManuscriptToUI } from "@/lib/data-transformer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot } from "lucide-react"

// Function to assign diverse images with much more variety
function getFigureImage(manuscriptTitle: string, figureId: string, figureTitle: string): string {
  // Check if this is a newly created figure (starts with "figure-")
  // But don't override real figures that have specific IDs like "figure-1", "figure-2"
  if (figureId.startsWith('figure-') && !figureId.match(/^figure-\d+$/)) {
    // Return a placeholder image for newly created figures
    return '/placeholder-e9mgd.png'
  }
  
  // All available scientific images - use them all!
  const allImages = [
    '/protein-structures.png',
    '/protein-structure-control.png',
    '/molecular-interactions.png',
    '/hsp70-binding.png',
    '/co-chaperone-recruitment.png',
    '/atp-folding-cycle.png',
    '/microscopy-0-hours.png',
    '/microscopy-two-hours.png', 
    '/microscopy-6-hours.png',
    '/microscopy-24-hours.png',
    '/quantitative-analysis-graph.png',
    '/quantitative-aggregation-graph.png',
    '/protein-aggregation-time-course.png'
  ]
  
  // Create maximum diversity by combining multiple factors
  const seed = manuscriptTitle + figureId + figureTitle
  const hash1 = Math.abs(hashCode(seed))
  const hash2 = Math.abs(hashCode(seed.split('').reverse().join('')))
  const hash3 = Math.abs(hashCode(figureId + manuscriptTitle.length))
  const hash4 = Math.abs(hashCode(figureTitle + figureId.length))
  
  // Use multiple hash combinations with different multipliers for maximum distribution
  const imageIndex = (hash1 + hash2 * 7 + hash3 * 13 + hash4 * 23) % allImages.length
  
  return allImages[imageIndex]
}

// Simple hash function for consistent image assignment
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

interface ManuscriptDetailProps {
  msid: string
  onBack: () => void
  useApiData: boolean
}

// Mock manuscripts matching the dashboard data
const mockManuscriptDetails = {
  "EMBO-2024-001": {
    id: "EMBO-2024-001",
    title: "Novel mechanisms of protein folding in cellular stress responses under oxidative conditions",
    authors: ["Smith, J.", "Johnson, A.", "Williams, R.", "Chen, L.", "Rodriguez, M."],
    received: "2024-12-14",
    doi: "10.1038/s41586-024-07123-4",
    lastModified: "2024-12-30T10:30:00Z",
    status: "on-hold",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "On hold",
    modifiedBy: "Dr. Sarah Chen",
    priority: "high",
  },
  "EMBO-2024-002": {
    id: "EMBO-2024-002", 
    title: "CRISPR-Cas9 mediated genome editing in pluripotent stem cells",
    authors: ["Brown, K.", "Davis, M.", "Wilson, P.", "Thompson, S."],
    received: "2024-12-25",
    doi: "10.1016/j.cell.2024.02.015",
    lastModified: "2024-12-28T09:15:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress", 
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "normal",
  },
  "EMBO-2024-003": {
    id: "EMBO-2024-003",
    title: "Mitochondrial dynamics in neurodegeneration",
    authors: ["Garcia, L.", "Martinez, A.", "Lopez, C."],
    received: "2024-12-17",
    doi: "10.1038/s41593-024-01567-8", 
    lastModified: "2024-12-28T16:18:01Z",
    status: "new-submission",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "New submission",
    modifiedBy: "Dr. Emily Watson",
    priority: "urgent",
  },
  "EMBO-2024-004": {
    id: "EMBO-2024-004",
    title: "Molecular mechanisms of DNA repair in cancer cells", 
    authors: ["Harris, K.", "Moore, L.", "Jackson, P.", "White, S."],
    received: "2024-12-17",
    doi: "10.1038/s41467-024-45678-9",
    lastModified: "2024-12-29T11:22:33Z", 
    status: "on-hold",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "On hold",
    modifiedBy: "Dr. Michael Rodriguez", 
    priority: "normal",
  },
  "EMBO-2024-005": {
    id: "EMBO-2024-005",
    title: "Epigenetic regulation of gene expression in developmental biology",
    authors: ["Martin, S.", "Johnson, A.", "Taylor, R.", "Anderson, K."],
    received: "2024-01-05",
    doi: "10.1038/s41588-024-01789-2",
    lastModified: "2024-01-12T14:45:00Z",
    status: "failed-to-deposit",
    assignedTo: "Dr. Emily Davis",
    currentStatus: "Failed to deposit",
    modifiedBy: "Dr. Emily Davis",
    priority: "urgent",
  },
  "EMBO-2024-006": {
    id: "EMBO-2024-006", 
    title: "Protein folding mechanisms in neurodegenerative disease progression",
    authors: ["Brown, T.", "White, J.", "Clark, M.", "Lewis, P."],
    received: "2024-01-03",
    doi: "10.1038/s41593-024-01234-5",
    lastModified: "2024-01-10T16:20:00Z",
    status: "waiting-for-data",
    assignedTo: "Dr. Sarah Wilson",
    currentStatus: "Waiting for data",
    modifiedBy: "Dr. Sarah Wilson",
    priority: "high",
  },
  "EMBO-2024-007": {
    id: "EMBO-2024-007",
    title: "Metabolic reprogramming in T cell activation and differentiation",
    authors: ["Wang, X.", "Liu, Y.", "Zhang, Z.", "Chen, W."],
    received: "2024-12-29",
    doi: "10.1038/s41590-024-01789-0",
    lastModified: "2024-12-30T08:45:00Z",
    status: "new-submission",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "New submission",
    modifiedBy: "Dr. Sarah Chen",
    priority: "normal",
  },
  "EMBO-2024-008": {
    id: "EMBO-2024-008",
    title: "Chromatin remodeling complexes in embryonic development",
    authors: ["Johnson, P.", "Williams, R.", "Brown, A.", "Davis, K."],
    received: "2024-12-23",
    doi: "10.1016/j.devcel.2024.04.008",
    lastModified: "2024-12-29T15:10:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "high",
  },
  "EMBO-2024-009": {
    id: "EMBO-2024-009",
    title: "Autophagy regulation in aging and longevity",
    authors: ["Martinez, C.", "Garcia, L.", "Rodriguez, M."],
    received: "2024-12-30",
    doi: "10.1038/s43587-024-00567-8",
    lastModified: "2024-12-30T17:30:00Z",
    status: "deposited",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "Deposited",
    modifiedBy: "Dr. Emily Watson",
    priority: "normal",
  },
  "EMBO-2024-010": {
    id: "EMBO-2024-010",
    title: "Immune checkpoint inhibitors in cancer immunotherapy",
    authors: ["Thompson, D.", "Anderson, S.", "Wilson, J.", "Taylor, M.", "Clark, R."],
    received: "2024-12-22",
    doi: "10.1126/scitranslmed.abc4567",
    lastModified: "2024-12-28T12:00:00Z",
    status: "waiting-for-data",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "Waiting for data",
    modifiedBy: "Dr. Sarah Chen",
    priority: "urgent",
  },
  "EMBO-2024-011": {
    id: "EMBO-2024-011",
    title: "Molecular mechanisms of DNA repair in cancer cells",
    authors: ["Harris, K.", "Moore, L.", "Jackson, P.", "White, S."],
    received: "2024-12-17",
    doi: "10.1038/s41467-024-45678-9",
    lastModified: "2024-12-29T10:45:00Z",
    status: "on-hold",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "On hold",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "high",
  },
  "EMBO-2024-012": {
    id: "EMBO-2024-012",
    title: "Stem cell niche dynamics in tissue regeneration",
    authors: ["Lee, S.", "Kim, H.", "Park, J.", "Choi, Y."],
    received: "2024-12-21",
    doi: "10.1016/j.stem.2024.05.012",
    lastModified: "2024-12-28T14:15:00Z",
    status: "failed-to-deposit",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "Failed to deposit",
    modifiedBy: "Dr. Emily Watson",
    priority: "normal",
  },
  "EMBO-2024-013": {
    id: "EMBO-2024-013",
    title: "Circadian rhythm regulation of metabolic pathways",
    authors: ["Zhang, L.", "Wang, M.", "Liu, X.", "Chen, H."],
    received: "2024-12-31",
    doi: "10.1038/s41586-024-07890-1",
    lastModified: "2024-12-31T09:00:00Z",
    status: "new-submission",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "New submission",
    modifiedBy: "Dr. Sarah Chen",
    priority: "normal",
  },
  "EMBO-2024-014": {
    id: "EMBO-2024-014",
    title: "Neuroplasticity mechanisms in learning and memory",
    authors: ["Brown, M.", "Davis, R.", "Wilson, K.", "Johnson, L."],
    received: "2024-12-20",
    doi: "10.1016/j.neuron.2024.06.015",
    lastModified: "2024-12-30T11:20:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "high",
  },
  "EMBO-2024-015": {
    id: "EMBO-2024-015",
    title: "Tumor microenvironment and cancer progression",
    authors: ["Garcia, P.", "Martinez, R.", "Lopez, A.", "Rodriguez, C."],
    received: "2024-12-19",
    doi: "10.1038/s41568-024-00678-2",
    lastModified: "2024-12-27T16:30:00Z",
    status: "waiting-for-data",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "Waiting for data",
    modifiedBy: "Dr. Emily Watson",
    priority: "normal",
  },
  "EMBO-2024-016": {
    id: "EMBO-2024-016",
    title: "Epigenetic inheritance across generations",
    authors: ["Taylor, J.", "Anderson, M.", "White, P.", "Harris, L."],
    received: "2024-12-18",
    doi: "10.1126/science.def7890",
    lastModified: "2024-12-29T13:45:00Z",
    status: "deposited",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "Deposited",
    modifiedBy: "Dr. Sarah Chen",
    priority: "urgent",
  },
  "EMBO-2024-017": {
    id: "EMBO-2024-017",
    title: "Microbiome-host interactions in health and disease",
    authors: ["Miller, K.", "Moore, S.", "Clark, J.", "Thompson, A."],
    received: "2024-12-16",
    doi: "10.1038/s41579-024-00890-3",
    lastModified: "2024-12-28T10:15:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "normal",
  },
  "EMBO-2024-018": {
    id: "EMBO-2024-018",
    title: "Gene therapy approaches for inherited diseases",
    authors: ["Lee, R.", "Kim, S.", "Park, H.", "Choi, K.", "Wang, L."],
    received: "2024-12-15",
    doi: "10.1016/j.ymthe.2024.07.020",
    lastModified: "2024-12-27T14:30:00Z",
    status: "in-progress",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Emily Watson",
    priority: "high",
  }
}

const getManuscriptDetail = async (msid: string) => {
  // Use data service to get manuscript with real figures
  try {
    console.log('🔍 Calling data service for manuscript:', msid)
    const response = await dataService.getManuscriptById(msid)
    console.log('📊 Data service response:', response)
    if (response.success && response.data) {
      console.log('✅ Data service returned manuscript with figures:', response.data.figures?.length || 0)
      return response.data
    }
  } catch (error) {
    console.error('❌ Error fetching manuscript from data service:', error)
  }
  
  // Fallback to mock data if data service fails
  console.log('⚠️ Data service failed, using fallback data for:', msid)
  const manuscriptData = mockManuscriptDetails[msid as keyof typeof mockManuscriptDetails] || {
    id: msid,
    title: "Molecular mechanisms of heat shock protein 70 in cellular stress response and protein folding dynamics",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Wang"],
    received: "2024-01-15",
    doi: "10.15252/embj.2024123456",
    lastModified: "2024-01-20T14:30:00Z",
    status: "in-progress",
    assignedTo: "Dr. Sarah Wilson",
    currentStatus: "In progress",
    modifiedBy: "Dr. Sarah Chen",
    priority: "high",
  }
  
  // Generate content based on manuscript title
  const generateAbstract = (title: string) => {
    if (title.includes('protein folding')) {
      return "Protein folding is a critical cellular process that can be disrupted under stress conditions. This study investigates novel mechanisms by which cells maintain protein homeostasis during oxidative stress. Using advanced proteomics and structural biology approaches, we identified key regulatory pathways that coordinate protein folding responses."
    } else if (title.includes('CRISPR')) {
      return "CRISPR-Cas9 technology has revolutionized genome editing in mammalian cells. This study focuses on optimizing CRISPR-mediated editing in pluripotent stem cells, addressing challenges related to efficiency and specificity. We developed new protocols for guide RNA design and delivery."
    } else if (title.includes('Mitochondrial')) {
      return "Mitochondrial dysfunction plays a central role in neurodegenerative diseases. This research investigates the dynamic regulation of mitochondrial networks in neuronal cells under pathological conditions using live-cell imaging and proteomics."
    } else if (title.includes('DNA repair')) {
      return "DNA repair mechanisms are frequently dysregulated in cancer cells, contributing to genomic instability and therapeutic resistance. This study examines molecular pathways involved in DNA damage response in various cancer cell lines."
    }
    return "This manuscript presents novel research findings that advance our understanding of fundamental biological processes and their implications for human health."
  }

  const generateKeywords = (title: string) => {
    if (title.includes('protein folding')) {
      return ["protein folding", "oxidative stress", "molecular chaperones", "proteostasis", "cellular adaptation"]
    } else if (title.includes('CRISPR')) {
      return ["CRISPR-Cas9", "genome editing", "pluripotent stem cells", "guide RNA", "precision medicine"]
    } else if (title.includes('Mitochondrial')) {
      return ["mitochondria", "neurodegeneration", "mitochondrial dynamics", "neuronal cells", "therapeutic targets"]
    } else if (title.includes('DNA repair')) {
      return ["DNA repair", "cancer", "genomic instability", "therapeutic resistance", "molecular pathways"]
    }
    return ["cell biology", "molecular medicine", "research", "biomedical science"]
  }

  // Return the complete manuscript data structure
  const finalManuscript = {
    ...manuscriptData,
    abstract: generateAbstract(manuscriptData.title),
    keywords: generateKeywords(manuscriptData.title),
    notes: manuscriptData.id === msid ? 
      (msid === "EMBO-2024-001" ? "Waiting for additional experimental data from authors" :
       msid === "EMBO-2024-002" ? "Comprehensive review in progress" :
       msid === "EMBO-2024-003" ? "Missing required metadata files" :
       msid === "EMBO-2024-004" ? "Pending author response to reviewer comments" :
       "Standard review process") :
      "Requires additional validation for protein structure data. Missing figure legends for panels C-E. Author contacted for clarification on methodology section.",
  dataAvailability:
    "The datasets generated and analyzed during the current study are available in the Gene Expression Omnibus repository under accession number GSE123456. Protein structure data are deposited in the Protein Data Bank under accession code 7ABC. All other data supporting the conclusions of this article are included within the article and its additional files.",
  figures: manuscriptData.figures || (() => {
    // Generate varied figure data based on manuscript ID
    const baseId = parseInt(manuscriptData.id.split('-')[2]) || 1;
    const figureCount = 1 + (baseId % 3); // 1-3 figures per manuscript
    const figures = [];
    
    for (let i = 1; i <= figureCount; i++) {
      const panelCount = 2 + ((baseId + i) % 4); // 2-5 panels per figure
      const panels = [];
      
      for (let j = 1; j <= panelCount; j++) {
        panels.push({
          id: `${i}${String.fromCharCode(64 + j)}`, // 1A, 1B, etc.
          description: `Panel ${i}${String.fromCharCode(64 + j)}: ${j === 1 ? 'Primary experimental data' : j === 2 ? 'Control conditions' : j === 3 ? 'Quantitative analysis' : j === 4 ? 'Statistical validation' : 'Supplementary results'}`,
          hasIssues: ((baseId + i + j) % 6) === 0 // Some panels have issues
        });
      }
      
      // Generate varied AI QC checks with realistic feedback
      const qcChecks = [];
      const aiCheckCount = 2 + (baseId + i) % 4; // 2-5 AI checks per figure
      
      // AI-generated checks with varied types and realistic content
      const aiCheckTypes = [
        {
          type: "error",
          message: "Image Resolution Insufficient",
          details: "AI detected image resolution below 300 DPI. Minimum required for publication is 300 DPI at final size.",
          aiGenerated: true
        },
        {
          type: "warning", 
          message: "Color Accessibility Issue",
          details: "AI identified potential color contrast issues that may not be accessible to colorblind readers.",
          aiGenerated: true
        },
        {
          type: "warning",
          message: "Figure Legend Incomplete",
          details: "AI analysis suggests figure legend may be missing statistical test details or sample sizes.",
          aiGenerated: true
        },
        {
          type: "error",
          message: "Scale Bar Missing",
          details: "AI detected missing scale bar in microscopy images. Scale information is required for reproducibility.",
          aiGenerated: true
        },
        {
          type: "info",
          message: "Image Quality Excellent",
          details: "AI analysis confirms high image quality with appropriate contrast and sharpness for publication.",
          aiGenerated: true
        },
        {
          type: "warning",
          message: "Statistical Annotation Needed",
          details: "AI suggests adding statistical significance indicators (p-values, confidence intervals) to the figure.",
          aiGenerated: true
        },
        {
          type: "error",
          message: "Data Reproducibility Concern",
          details: "AI flagged potential issues with data representation that may affect reproducibility.",
          aiGenerated: true
        },
        {
          type: "info",
          message: "Figure Format Compliant",
          details: "AI verification confirms figure meets journal formatting requirements and best practices.",
          aiGenerated: true
        },
        {
          type: "warning",
          message: "Panel Labeling Inconsistent",
          details: "AI detected inconsistent panel labeling style. Consider standardizing (A, B, C vs a, b, c).",
          aiGenerated: true
        },
        {
          type: "error",
          message: "Copyright Compliance Issue",
          details: "AI identified potential copyright concerns with image sources or data attribution.",
          aiGenerated: true
        }
      ];
      
      // Select random AI checks for this figure
      const selectedChecks = aiCheckTypes
        .sort(() => 0.5 - Math.random())
        .slice(0, aiCheckCount)
        .map(check => ({
          ...check,
          dismissed: Math.random() < 0.1, // 10% chance of being dismissed
          panelId: panels[Math.floor(Math.random() * panels.length)]?.id || `panel-${i}A`
        }));
      
      qcChecks.push(...selectedChecks);
      
      // Add some non-AI validation checks
      if ((baseId + i) % 5 === 0) {
        qcChecks.push({
          type: "error",
          message: "Manual Review Required",
          details: "Editor flagged this figure for manual review due to complex data presentation.",
          aiGenerated: false,
          dismissed: false,
          panelId: `panel-${i}A`
        });
      }
      
      figures.push({
        id: `fig${i}`,
        title: `Figure ${i}: ${manuscriptData.title.includes('protein') ? 'Protein structure analysis' : 
               manuscriptData.title.includes('CRISPR') ? 'CRISPR editing efficiency' : 
               manuscriptData.title.includes('Mitochondrial') ? 'Mitochondrial dynamics' : 
               manuscriptData.title.includes('DNA repair') ? 'DNA repair mechanisms' :
               manuscriptData.title.includes('Metabolic') ? 'T cell activation pathways' :
               manuscriptData.title.includes('Chromatin') ? 'Developmental gene expression' :
               manuscriptData.title.includes('Autophagy') ? 'Cellular degradation pathways' :
               manuscriptData.title.includes('Immune') ? 'Checkpoint inhibitor responses' :
               manuscriptData.title.includes('Stem cell') ? 'Tissue regeneration mechanisms' :
               manuscriptData.title.includes('Circadian') ? 'Metabolic rhythm analysis' :
               manuscriptData.title.includes('Neuroplasticity') ? 'Learning and memory formation' :
               manuscriptData.title.includes('Tumor') ? 'Microenvironment interactions' :
               manuscriptData.title.includes('inheritance') ? 'Epigenetic transmission patterns' :
               manuscriptData.title.includes('Microbiome') ? 'Host-microbe interactions' :
               manuscriptData.title.includes('Gene therapy') ? 'Therapeutic delivery systems' :
               'Research findings'}`,
        legend: `Figure ${i} shows detailed analysis related to ${manuscriptData.title.toLowerCase()}. Multiple panels demonstrate experimental results and controls.`,
        panels: panels,
        qcChecks: qcChecks
      });
    }
    
    return figures;
  })(),
  linkedData: (() => {
    // Generate varied linked data based on manuscript ID and research area
    const baseId = parseInt(manuscriptData.id.split('-')[2]) || 1;
    const linkedData = [];
    
    // Research area specific data repositories
    if (manuscriptData.title.includes('protein') || manuscriptData.title.includes('structure')) {
      linkedData.push({
        type: "PDB",
        identifier: `${7 + baseId}ABC`,
        url: `https://www.rcsb.org/structure/${7 + baseId}ABC`,
        description: "Crystal structure of protein complex",
      });
      linkedData.push({
        type: "UniProt",
        identifier: `P0${8100 + baseId}`,
        url: `https://www.uniprot.org/uniprot/P0${8100 + baseId}`,
        description: "Protein sequence and functional annotation",
      });
    }
    
    if (manuscriptData.title.includes('CRISPR') || manuscriptData.title.includes('gene')) {
      linkedData.push({
        type: "GEO",
        identifier: `GSE${123000 + baseId * 10}`,
        url: `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE${123000 + baseId * 10}`,
        description: "Gene expression profiling data",
      });
      linkedData.push({
        type: "SRA",
        identifier: `SRP${300000 + baseId * 5}`,
        url: `https://www.ncbi.nlm.nih.gov/sra/SRP${300000 + baseId * 5}`,
        description: "Raw sequencing reads",
      });
    }
    
    if (manuscriptData.title.includes('Metabolic') || manuscriptData.title.includes('cell')) {
      linkedData.push({
        type: "GEO", 
        identifier: `GSE${124000 + baseId * 7}`,
        url: `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE${124000 + baseId * 7}`,
        description: "Single-cell RNA sequencing data",
      });
      linkedData.push({
        type: "MetaboLights",
        identifier: `MTBLS${1000 + baseId * 3}`,
        url: `https://www.ebi.ac.uk/metabolights/MTBLS${1000 + baseId * 3}`,
        description: "Metabolomics experimental data",
      });
    }
    
    if (manuscriptData.title.includes('Chromatin') || manuscriptData.title.includes('Epigenetic')) {
      linkedData.push({
        type: "GEO",
        identifier: `GSE${125000 + baseId * 12}`,
        url: `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE${125000 + baseId * 12}`,
        description: "ChIP-seq and ATAC-seq data",
      });
      linkedData.push({
        type: "ArrayExpress",
        identifier: `E-MTAB-${8000 + baseId * 4}`,
        url: `https://www.ebi.ac.uk/arrayexpress/experiments/E-MTAB-${8000 + baseId * 4}`,
        description: "Chromatin accessibility profiling",
      });
    }
    
    // Add generic repositories for other research areas
    if (linkedData.length === 0) {
      linkedData.push({
        type: "GEO",
        identifier: `GSE${120000 + baseId * 15}`,
        url: `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE${120000 + baseId * 15}`,
        description: "Transcriptomic analysis data",
      });
      
      if (baseId % 3 === 0) {
        linkedData.push({
          type: "ProteomeXchange", 
          identifier: `PXD0${20000 + baseId * 2}`,
          url: `http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD0${20000 + baseId * 2}`,
          description: "Mass spectrometry proteomics data",
        });
      }
    }
    
    return linkedData;
  })(),
  linkedInfo: (() => {
    // Generate varied linked info based on manuscript ID and research area
    const baseId = parseInt(manuscriptData.id.split('-')[2]) || 1;
    const linkedInfo = [];
    
    // Always include at least one protocol
    const protocolTypes = [
      "protein-purification", "cell-culture", "molecular-cloning", "immunofluorescence",
      "western-blot", "qpcr-analysis", "flow-cytometry", "microscopy-imaging"
    ];
    const protocolType = protocolTypes[baseId % protocolTypes.length];
    
    linkedInfo.push({
      type: "Protocol",
      url: `https://protocols.io/view/${protocolType}-protocol-${baseId}abc`,
      description: `${protocolType.replace('-', ' ')} protocol`,
    });
    
    // Add supplementary materials (varies by manuscript)
    if (baseId % 2 === 0) {
      linkedInfo.push({
        type: "Supplementary",
        url: `https://example.com/supplementary-data-${baseId}`,
        description: "Supplementary materials and methods",
      });
    }
    
    // Add additional resources based on research area
    if (manuscriptData.title.includes('CRISPR') || manuscriptData.title.includes('gene')) {
      linkedInfo.push({
        type: "Repository",
        url: `https://github.com/lab-${baseId}/crispr-analysis`,
        description: "Analysis code and scripts",
      });
    }
    
    if (manuscriptData.title.includes('structure') || manuscriptData.title.includes('protein')) {
      linkedInfo.push({
        type: "Model",
        url: `https://alphafold.ebi.ac.uk/entry/AF-P0${8100 + baseId}`,
        description: "AlphaFold structure prediction",
      });
    }
    
    return linkedInfo;
  })(),
  qcChecks: (() => {
    // Generate varied QC checks based on manuscript ID
    const baseId = parseInt(manuscriptData.id.split('-')[2]) || 1;
    const checks = [];
    
    // Add errors based on manuscript ID
    if (baseId % 7 === 0) {
      checks.push({
        level: "manuscript",
        type: "error",
        category: "metadata",
        message: "Missing author ORCID for corresponding author",
        details: "The corresponding author is missing a valid ORCID identifier.",
        aiGenerated: false,
        dismissed: false,
        followUp: true,
      });
    }
    
    if (baseId % 9 === 0) {
      checks.push({
        level: "manuscript",
        type: "error", 
        category: "data",
        message: "Data availability statement incomplete",
        details: "Required data repository information is missing from the manuscript.",
        aiGenerated: false,
        dismissed: false,
        followUp: true,
      });
    }
    
    // Add warnings based on manuscript ID
    if (baseId % 5 === 0) {
      checks.push({
        level: "manuscript",
        type: "warning",
        category: "formatting",
        message: "Inconsistent reference formatting",
        details: "Some references use different formatting style than journal requirements.",
        aiGenerated: true,
        dismissed: false,
        followUp: false,
      });
    }
    
    if (baseId % 6 === 0) {
      checks.push({
        level: "manuscript",
        type: "warning",
        category: "ethics",
        message: "Ethics approval statement needs clarification",
        details: "Ethics committee approval details require additional information.",
        aiGenerated: false,
        dismissed: false,
        followUp: true,
      });
    }
    
    // Add info checks for most manuscripts
    if (baseId % 3 === 0) {
      checks.push({
        level: "manuscript",
        type: "info",
        category: "quality",
        message: "Manuscript structure follows journal guidelines",
        details: "All required sections are present and properly formatted.",
        aiGenerated: true,
        dismissed: false,
        followUp: false,
      });
    }
    
    if (baseId % 4 === 0) {
      checks.push({
        level: "manuscript",
        type: "info",
        category: "language",
        message: "Language quality check passed",
        details: "No significant grammar or spelling issues detected.",
        aiGenerated: true,
        dismissed: false,
        followUp: false,
      });
    }
    
    // Ensure at least one check exists
    if (checks.length === 0) {
      checks.push({
        level: "manuscript",
        type: "info",
        category: "general",
        message: "Initial review completed",
        details: "Manuscript has passed initial quality assessment.",
        aiGenerated: true,
        dismissed: false,
        followUp: false,
      });
    }
    
    return checks;
  })(),
  collaborationStatus: {
    isBeingEdited: false,
    editedBy: null,
    lastActivity: "2024-01-20T14:30:00Z",
  },
  legend: "This is a sample figure legend.",
  sourceData: (() => {
    // Generate varied source data files based on manuscript ID and research area
    const baseId = parseInt(manuscriptData.id.split('-')[2]) || 1;
    const sourceData = [];
    
    // File types and sizes vary by research area
    if (manuscriptData.title.includes('protein') || manuscriptData.title.includes('structure')) {
      sourceData.push({
        filename: `protein_analysis_${baseId}.xlsx`,
        url: `/files/protein_analysis_${baseId}.xlsx`,
        description: "Protein characterization data",
        size: `${1.5 + (baseId % 3) * 0.5} MB`,
        type: "xlsx",
      });
      sourceData.push({
        filename: `structural_data_${baseId}.pdb`,
        url: `/files/structural_data_${baseId}.pdb`,
        description: "Structural coordinates",
        size: `${200 + baseId * 50} KB`,
        type: "pdb",
      });
    } else if (manuscriptData.title.includes('CRISPR') || manuscriptData.title.includes('gene')) {
      sourceData.push({
        filename: `sequencing_results_${baseId}.fastq.gz`,
        url: `/files/sequencing_results_${baseId}.fastq.gz`,
        description: "Raw sequencing data",
        size: `${5 + baseId * 2} GB`,
        type: "fastq",
      });
      sourceData.push({
        filename: `gene_expression_${baseId}.csv`,
        url: `/files/gene_expression_${baseId}.csv`,
        description: "Gene expression matrix",
        size: `${800 + baseId * 100} KB`,
        type: "csv",
      });
    } else if (manuscriptData.title.includes('Metabolic') || manuscriptData.title.includes('cell')) {
      sourceData.push({
        filename: `metabolomics_data_${baseId}.xlsx`,
        url: `/files/metabolomics_data_${baseId}.xlsx`,
        description: "Metabolite measurements",
        size: `${2.1 + (baseId % 4) * 0.3} MB`,
        type: "xlsx",
      });
      sourceData.push({
        filename: `flow_cytometry_${baseId}.fcs`,
        url: `/files/flow_cytometry_${baseId}.fcs`,
        description: "Flow cytometry data files",
        size: `${15 + baseId * 5} MB`,
        type: "fcs",
      });
    } else if (manuscriptData.title.includes('Chromatin') || manuscriptData.title.includes('Epigenetic')) {
      sourceData.push({
        filename: `chipseq_peaks_${baseId}.bed`,
        url: `/files/chipseq_peaks_${baseId}.bed`,
        description: "ChIP-seq peak coordinates",
        size: `${500 + baseId * 75} KB`,
        type: "bed",
      });
      sourceData.push({
        filename: `accessibility_data_${baseId}.bw`,
        url: `/files/accessibility_data_${baseId}.bw`,
        description: "Chromatin accessibility tracks",
        size: `${25 + baseId * 8} MB`,
        type: "bigwig",
      });
    } else {
      // Generic data files
      sourceData.push({
        filename: `experimental_data_${baseId}.xlsx`,
        url: `/files/experimental_data_${baseId}.xlsx`,
        description: "Primary experimental data",
        size: `${1.0 + (baseId % 5) * 0.4} MB`,
        type: "xlsx",
      });
      
      if (baseId % 3 === 0) {
        sourceData.push({
          filename: `raw_measurements_${baseId}.csv`,
          url: `/files/raw_measurements_${baseId}.csv`,
          description: "Raw measurement data",
          size: `${600 + baseId * 120} KB`,
          type: "csv",
        });
      }
      
      if (baseId % 4 === 0) {
        sourceData.push({
          filename: `statistical_analysis_${baseId}.R`,
          url: `/files/statistical_analysis_${baseId}.R`,
          description: "Statistical analysis scripts",
          size: `${45 + baseId * 8} KB`,
          type: "R",
        });
      }
    }
    
    return sourceData;
  })(),
  qcChecks: manuscriptData.qcChecks || []
  }
  
  console.log('📋 Final manuscript data:', finalManuscript)
  console.log('📊 Final manuscript figures count:', finalManuscript.figures?.length || 0)
  return finalManuscript
}

const ManuscriptDetail = ({ msid, onBack, useApiData }: ManuscriptDetailProps) => {
  const [selectedView, setSelectedView] = useState<"manuscript" | "list">("manuscript")
  const [linkedData, setLinkedData] = useState(mockLinkedData)
  const [sourceData, setSourceData] = useState(mockSourceData)
  const [editingLinkedData, setEditingLinkedData] = useState<string | null>(null)
  const [editingSourceData, setEditingSourceData] = useState<string | null>(null)
  const [showExpandedFigure, setShowExpandedFigure] = useState<string | null>(null)
  const [overlayVisibility, setOverlayVisibility] = useState<Record<string, boolean>>({})
  const [manuscript, setManuscript] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [dataAvailability, setDataAvailability] = useState("")
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [isEditingLinkedData, setIsEditingLinkedData] = useState(false)
  const [isEditingSourceData, setIsEditingSourceData] = useState(false)
  const [editingLinkedDataIndex, setEditingLinkedDataIndex] = useState<number | null>(null)
  const [editingSourceDataIndex, setEditingSourceDataIndex] = useState<number | null>(null)
  const [linkedDataForm, setLinkedDataForm] = useState({
    type: "",
    identifier: "",
    url: "",
    description: "",
    isCustom: false,
  })
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState("")
  const [isEditingDataAvailability, setIsEditingDataAvailability] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showFullText, setShowFullText] = useState(false)
  const [currentEditor, setCurrentEditor] = useState<{
    name: string
    email: string
    editingSince: Date
  } | null>(() => {
    // Simulate someone editing EMBO-2024-002 for demo purposes
    if (msid === "EMBO-2024-002") {
      return {
        name: "Dr. Sarah Chen",
        email: "s.chen@embo.org",
        editingSince: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      }
    }
    return null
  })

  const [showConflictDetails, setShowConflictDetails] = useState(false)

  // Fetch API data for manuscript details
  const fetchApiManuscriptDetail = async () => {
    setIsLoadingApi(true)
    try {
      // Convert MSID to numeric ID for API call
      // MSIDs like "EMBO-2024-001" should map to numeric IDs like "1"
      let numericId = '1' // default fallback
      if (msid.includes('EMBO-2024-')) {
        const idPart = msid.replace('EMBO-2024-', '')
        numericId = parseInt(idPart, 10).toString()
      }
      
      console.log(`🔍 Fetching API data for MSID: ${msid} -> ID: ${numericId}`)
      const response = await fetch(`/api/v1/manuscripts/${numericId}`)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      const apiData = await response.json()
      
      // Transform API data to match our manuscript format
      const transformedManuscript = transformApiManuscriptToUI(apiData)
      
      setManuscript(transformedManuscript as any)
      setNotes(transformedManuscript.notes)
      setDataAvailability(transformedManuscript.dataAvailability)
    } catch (error) {
      console.error('Failed to fetch API manuscript details:', error)
      // Keep using mock data on error - fallback to mock data
      const mockManuscript = await getManuscriptDetail(msid)
      setManuscript(mockManuscript)
      setNotes((mockManuscript as any)?.notes || "")
      setDataAvailability((mockManuscript as any)?.dataAvailability || "")
    } finally {
      setIsLoadingApi(false)
    }
  }

  // Update manuscript data when data source changes
  // Load manuscript data on component mount
  useEffect(() => {
    const loadManuscript = async () => {
      try {
        const manuscriptData = await getManuscriptDetail(msid)
        setManuscript(manuscriptData)
        setNotes((manuscriptData as any)?.notes || "")
        setDataAvailability((manuscriptData as any)?.dataAvailability || "")
        setNotesValue((manuscriptData as any)?.notes || "")
      } catch (error) {
        console.error('Error loading manuscript:', error)
      }
    }
    
    loadManuscript()
  }, [msid])

  useEffect(() => {
    if (useApiData) {
      fetchApiManuscriptDetail()
    } else {
      // Reset to mock data
      const loadMockManuscript = async () => {
        try {
          const mockManuscript = await getManuscriptDetail(msid)
          setManuscript(mockManuscript)
          setNotes((mockManuscript as any)?.notes || "")
          setDataAvailability((mockManuscript as any)?.dataAvailability || "")
          setNotesValue((mockManuscript as any)?.notes || "")
        } catch (error) {
          console.error('Error loading mock manuscript:', error)
        }
      }
      loadMockManuscript()
    }
  }, [useApiData, msid])

  const [editingConflicts, setEditingConflicts] = useState<{
    hasConflicts: boolean
    conflicts: Array<{
      type: "ai_check" | "source_data" | "notes" | "panel_data"
      description: string
      conflictedBy: string
      timestamp: Date
    }>
  }>(() => {
    // Simulate editing conflicts for EMBO-2024-002
    if (msid === "EMBO-2024-002") {
      return {
        hasConflicts: true,
        conflicts: [
          {
            type: "ai_check",
            description: "AI Check for Figure 1 Panel A approved",
            conflictedBy: "Dr. Michael Rodriguez",
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          },
          {
            type: "source_data",
            description: "Source data file updated for Figure 2",
            conflictedBy: "Dr. Emily Watson",
            timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
          },
          {
            type: "notes",
            description: "Manuscript notes modified",
            conflictedBy: "Dr. Sarah Chen",
            timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
          },
        ],
      }
    }
    return { hasConflicts: false, conflicts: [] }
  })

  const [sourceDataForm, setSourceDataForm] = useState({
    filename: "",
    url: "",
    description: "",
    size: "",
    type: "",
    file: null as File | null,
    selectedExistingFile: "",
  })

  const [editingPanel, setEditingPanel] = useState<{
    figureIndex: number
    panelIndex: number
    panel: any
  } | null>(null)
  const [isEditingPanel, setIsEditingPanel] = useState(false)
  const [panelForm, setPanelForm] = useState({
    description: "",
    linkType: "none", // 'none', 'sourceData', 'linkedData', 'newLinkedData'
    sourceDataId: "",
    linkedDataId: "",
    newLinkedData: {
      type: "",
      identifier: "",
      url: "",
      description: "",
      isCustom: false,
    },
  })

  const [editingFigure, setEditingFigure] = useState<{
    figureIndex: number
    figure: any
  } | null>(null)
  const [isEditingFigure, setIsEditingFigure] = useState(false)
  const [figureForm, setFigureForm] = useState({
    title: "",
    caption: "",
    linkType: "none", // 'none', 'sourceData', 'linkedData', 'newLinkedData'
    sourceDataId: "",
    linkedDataId: "",
    newLinkedData: {
      type: "",
      identifier: "",
      url: "",
      description: "",
      isCustom: false,
    },
  })

  const repositories = [
    { name: "PDB", label: "Protein Data Bank", urlPattern: "https://www.rcsb.org/structure/{id}" },
    { name: "UniProt", label: "UniProt Knowledgebase", urlPattern: "https://www.uniprot.org/uniprot/{id}" },
    {
      name: "GEO",
      label: "Gene Expression Omnibus",
      urlPattern: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={id}",
    },
    { name: "ArrayExpress", label: "ArrayExpress", urlPattern: "https://www.ebi.ac.uk/arrayexpress/experiments/{id}" },
    { name: "BioProject", label: "NCBI BioProject", urlPattern: "https://www.ncbi.nlm.nih.gov/bioproject/{id}" },
    { name: "SRA", label: "Sequence Read Archive", urlPattern: "https://www.ncbi.nlm.nih.gov/sra/{id}" },
    { name: "ChEMBL", label: "ChEMBL Database", urlPattern: "https://www.ebi.ac.uk/chembl/compound_report_card/{id}" },
    { name: "EMDB", label: "Electron Microscopy Data Bank", urlPattern: "https://www.ebi.ac.uk/emdb/entry/{id}" },
    { name: "Custom", label: "Custom Repository", urlPattern: "" },
  ]

  const generateUrl = (repositoryType: string, accession: string) => {
    const repo = repositories.find((r) => r.name === repositoryType)
    if (!repo || !repo.urlPattern) return ""
    return repo.urlPattern.replace("{id}", accession)
  }

  const generateRepositoryUrl = (repositoryType: string, accession: string) => {
    const repo = repositories.find((r) => r.name === repositoryType)
    if (!repo || !repo.urlPattern) return ""
    return repo.urlPattern.replace("{id}", accession)
  }

  const handleLinkedDataSubmit = () => {
    const newEntry = {
      type: linkedDataForm.type,
      identifier: linkedDataForm.identifier,
      url: linkedDataForm.isCustom ? linkedDataForm.url : generateUrl(linkedDataForm.type, linkedDataForm.identifier),
      description: linkedDataForm.description,
    }

    if (editingLinkedDataIndex !== null) {
      const updatedLinkedData = [...linkedData]
      updatedLinkedData[editingLinkedDataIndex] = newEntry
      setLinkedData(updatedLinkedData)
    } else {
      setLinkedData([...linkedData, newEntry])
    }

    setLinkedDataForm({ type: "", identifier: "", url: "", description: "", isCustom: false })
    setIsEditingLinkedData(false)
    setEditingLinkedDataIndex(null)
  }

  const handleEditLinkedData = (index: number) => {
    const entry = linkedData[index]
    const isCustom = !repositories.find((r) => r.name === entry.type && r.urlPattern)

    setLinkedDataForm({
      type: entry.type,
      identifier: entry.identifier,
      url: entry.url,
      description: entry.description,
      isCustom,
    })
    setEditingLinkedDataIndex(index)
    setIsEditingLinkedData(true)
  }

  const handleRemoveLinkedData = (index: number) => {
    const updatedLinkedData = linkedData.filter((_, i) => i !== index)
    setLinkedData(updatedLinkedData)
  }

  const handleEditSourceData = (index: number) => {
    const data = sourceDataFiles[index]
    setSourceDataForm({
      filename: data.name,
      url: `/files/${data.name}`,
      description: `Source data file: ${data.name}`,
      size: data.size,
      type: data.type,
      file: null,
      selectedExistingFile: data.name,
    })
    setEditingSourceDataIndex(index)
    setIsEditingSourceData(true)
  }

  const handleAddSourceData = () => {
    setSourceDataForm({
      filename: "",
      url: "",
      description: "",
      size: "",
      type: "",
      file: null,
      selectedExistingFile: "",
    })
    setEditingSourceDataIndex(null)
    setIsEditingSourceData(true)
  }

  const handleRemoveSourceData = (index: number) => {
    setSourceData((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSourceDataSubmit = () => {
    const filename = sourceDataForm.file?.name || sourceDataForm.filename
    const url = sourceDataForm.file
      ? URL.createObjectURL(sourceDataForm.file)
      : sourceDataForm.url || `/files/${filename}`

    const newData = {
      id: editingSourceDataIndex !== null ? sourceDataFiles[editingSourceDataIndex].id : Date.now(),
      name: filename || "",
      type: sourceDataForm.type || filename?.split('.').pop() || "unknown",
      size: sourceDataForm.size || (sourceDataForm.file ? `${(sourceDataForm.file.size / 1024 / 1024).toFixed(1)} MB` : "Unknown"),
    }

    if (editingSourceDataIndex !== null) {
      const updatedSourceData = [...sourceDataFiles]
      updatedSourceData[editingSourceDataIndex] = newData
      setSourceDataFiles(updatedSourceData)
    } else {
      setSourceDataFiles([...sourceDataFiles, newData])
    }

    setSourceDataForm({
      filename: "",
      url: "",
      description: "",
      size: "",
      type: "",
      file: null,
      selectedExistingFile: "",
    })
    setEditingSourceDataIndex(null)
    setIsEditingSourceData(false)
  }

  const handleEditPanel = (figureIndex: number, panelIndex: number) => {
    const panel = manuscript.figures[figureIndex].panels[panelIndex]
    setPanelForm({
      description: panel.description,
      linkType: "none",
      sourceDataId: "",
      linkedDataId: "",
      newLinkedData: {
        type: "",
        identifier: "",
        url: "",
        description: "",
        isCustom: false,
      },
    })
    setEditingPanel({ figureIndex, panelIndex, panel })
    setIsEditingPanel(true)
  }

  const handleEditFigure = (figureIndex: number) => {
    const figure = manuscript.figures[figureIndex]
    setFigureForm({
      title: figure.title,
      caption: figure.legend,
      linkType: "none",
      sourceDataId: "",
      linkedDataId: "",
      newLinkedData: {
        type: "",
        identifier: "",
        url: "",
        description: "",
        isCustom: false,
      },
    })
    setEditingFigure({ figureIndex, figure })
    setIsEditingFigure(true)
  }

  const handlePanelFormSubmit = () => {
    if (!editingPanel) return

    // Update panel description
    const updatedFigures = [...manuscript.figures]
    updatedFigures[editingPanel.figureIndex].panels[editingPanel.panelIndex].description = panelForm.description

    setManuscript((prev) => ({ ...prev, figures: updatedFigures }))

    // Handle linking logic here (would update panel's linked data reference)
    if (panelForm.linkType === "newLinkedData" && panelForm.newLinkedData.type) {
      // Add new linked data entry
      const newEntry = {
        type: panelForm.newLinkedData.type,
        identifier: panelForm.newLinkedData.identifier,
        url: panelForm.newLinkedData.isCustom
          ? panelForm.newLinkedData.url
          : generateRepositoryUrl(panelForm.newLinkedData.type, panelForm.newLinkedData.identifier),
        description: panelForm.newLinkedData.description,
      }
      setLinkedData((prev) => [...prev, newEntry])
    }

    setIsEditingPanel(false)
    setEditingPanel(null)
  }

  const handleFigureFormSubmit = () => {
    if (!editingFigure) return

    // Update figure title and caption
    const updatedFigures = [...manuscript.figures]
    updatedFigures[editingFigure.figureIndex].title = figureForm.title
    updatedFigures[editingFigure.figureIndex].legend = figureForm.caption

    setManuscript((prev) => ({ ...prev, figures: updatedFigures }))

    // Handle linking logic for figure-level data
    if (figureForm.linkType === "newLinkedData" && figureForm.newLinkedData.type) {
      // Add new linked data entry
      const newEntry = {
        type: figureForm.newLinkedData.type,
        identifier: figureForm.newLinkedData.identifier,
        url: figureForm.newLinkedData.isCustom
          ? figureForm.newLinkedData.url
          : generateRepositoryUrl(figureForm.newLinkedData.type, figureForm.newLinkedData.identifier),
        description: panelForm.newLinkedData.description,
      }
      setLinkedData((prev) => [...prev, newEntry])

      // Link the new data to the figure
      if (!(updatedFigures[editingFigure.figureIndex] as any).linkedData) {
        (updatedFigures[editingFigure.figureIndex] as any).linkedData = []
      }
      (updatedFigures[editingFigure.figureIndex] as any).linkedData.push(newEntry)
    } else if (figureForm.linkType === "sourceData" && figureForm.sourceDataId) {
      // Link existing source data to figure
      const sourceFile = sourceData.find((file) => file.filename === figureForm.sourceDataId)
      if (sourceFile) {
        if (!(updatedFigures[editingFigure.figureIndex] as any).linkedData) {
          (updatedFigures[editingFigure.figureIndex] as any).linkedData = []
        }
        (updatedFigures[editingFigure.figureIndex] as any).linkedData.push({
          type: "Source Data",
          identifier: sourceFile.filename,
          url: sourceFile.url,
          description: `Source data file: ${sourceFile.filename}`,
        })
      }
    } else if (figureForm.linkType === "linkedData" && figureForm.linkedDataId) {
      // Link existing linked data to figure
      const existingData = linkedData.find((data) => `${data.type}-${data.identifier}` === figureForm.linkedDataId)
      if (existingData) {
        if (!(updatedFigures[editingFigure.figureIndex] as any).linkedData) {
          (updatedFigures[editingFigure.figureIndex] as any).linkedData = []
        }
        (updatedFigures[editingFigure.figureIndex] as any).linkedData.push(existingData)
      }
    }

    setManuscript((prev) => ({ ...prev, figures: updatedFigures }))
    setIsEditingFigure(false)
    setEditingFigure(null)
  }

  const handleAddFigure = () => {
    const newFigure = {
      id: `figure-${Date.now()}`,
      title: `Figure ${manuscript.figures.length + 1}`,
      legend: "",
      sort_order: manuscript.figures.length + 1,
      panels: [],
      links: [],
      source_data: [],
      check_results: [],
      linkedData: [],
      qcChecks: []
    }

    setManuscript((prev) => ({
      ...prev,
      figures: [...prev.figures, newFigure],
    }))
  }

  const handleDeleteFigure = (figureIndex: number) => {
    if (window.confirm("Are you sure you want to delete this figure?")) {
      setManuscript((prev) => ({
        ...prev,
        figures: prev.figures.filter((_, index) => index !== figureIndex),
      }))
    }
  }

  const handleSaveNotes = () => {
    console.log("[v0] Saving notes for manuscript:", manuscript?.id, "Notes:", notesValue)
    setIsEditingNotes(false)
    // Update the manuscript object and local state
    if (manuscript) {
      manuscript.notes = notesValue
    }
    setNotes(notesValue) // Also update the notes state to trigger the useEffect
  }

  useEffect(() => {
    if (!manuscript) return
    
    const timer = setTimeout(() => {
      if (
        notes !== manuscript?.notes ||
        dataAvailability !== manuscript?.dataAvailability ||
        linkedData !== manuscript?.linkedData
      ) {
        setManuscript((prev) => ({
          ...prev,
          notes,
          dataAvailability,
          linkedData,
          lastModified: new Date().toISOString(),
        }))
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [notes, dataAvailability, linkedData, manuscript?.notes, manuscript?.dataAvailability])

  const getStatusBadge = (status: string, priority: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let icon = null
    let className = ""

    switch (status) {
      case "needs-validation":
        variant = "destructive"
        icon = <AlertTriangle className="w-3 h-3 mr-1" />
        break
      case "validated":
        variant = "secondary"
        icon = <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
        className = "bg-emerald-50 text-emerald-700 border-emerald-200"
        break
      case "in-progress":
        icon = <Clock className="w-3 h-3 mr-1 text-slate-500" />
        break
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant} className={`flex items-center ${className}`}>
          {icon}
          {status.replace("-", " ")}
        </Badge>
        {priority === "urgent" && (
          <Badge variant="destructive" className="text-xs">
            URGENT
          </Badge>
        )}
        {priority === "high" && (
          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
            HIGH
          </Badge>
        )}
      </div>
    )
  }

  const getQCIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
    }
  }

  const renderCheckActions = (check: any, location: string, index: number) => {
    if (check.aiGenerated) {
      // AI checks can be approved or ignored
      const checkId = getCheckId(check, location, index)
      const isApproved = approvedChecks.has(checkId)
      const isIgnored = ignoredChecks.has(checkId)
      
      return (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            className={`${isApproved ? 'bg-green-100 text-green-700 border-green-300' : 'text-green-600 hover:text-green-700 bg-transparent'}`}
            onClick={() => {
              const newApprovedChecks = new Set(approvedChecks)
              if (isApproved) {
                newApprovedChecks.delete(checkId)
              } else {
                newApprovedChecks.add(checkId)
                // Remove from ignored if it was ignored
                const newIgnoredChecks = new Set(ignoredChecks)
                newIgnoredChecks.delete(checkId)
                setIgnoredChecks(newIgnoredChecks)
              }
              setApprovedChecks(newApprovedChecks)
            }}
          >
            <Check className="w-3 h-3" />
            <span className="sr-only">{isApproved ? 'Unapprove' : 'Approve'}</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`${isIgnored ? 'bg-gray-100 text-gray-700 border-gray-300' : 'text-gray-600 hover:text-gray-700 bg-transparent'}`}
            onClick={() => {
              const newIgnoredChecks = new Set(ignoredChecks)
              if (isIgnored) {
                newIgnoredChecks.delete(checkId)
              } else {
                newIgnoredChecks.add(checkId)
                // Remove from approved if it was approved
                const newApprovedChecks = new Set(approvedChecks)
                newApprovedChecks.delete(checkId)
                setApprovedChecks(newApprovedChecks)
              }
              setIgnoredChecks(newIgnoredChecks)
            }}
          >
            <X className="w-3 h-3" />
            <span className="sr-only">{isIgnored ? 'Unignore' : 'Ignore'}</span>
          </Button>
        </div>
      )
    } else {
      // Validation issues require fixes
      return (
        <div className="flex gap-1">
          <Badge variant="destructive" className="text-xs">
            Fix Required
          </Badge>
        </div>
      )
    }
  }

  const getCheckId = (check: any, location: string, index: number) => {
    return `${location}-${index}-${check.message.substring(0, 20)}`
  }

  const [approvedChecks, setApprovedChecks] = useState(new Set())
  const [ignoredChecks, setIgnoredChecks] = useState(new Set())
  const [showIgnoredChecks, setShowIgnoredChecks] = useState(false)

  const getQCActions = (check: any, location = "general", index = 0) => {
    const checkId = getCheckId(check, location, index)

    if (check.aiGenerated) {
      if (approvedChecks.has(checkId)) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200">
              Approved
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 h-6 px-2"
              onClick={() => {
                const newApprovedChecks = new Set(approvedChecks)
                newApprovedChecks.delete(checkId)
                setApprovedChecks(newApprovedChecks)
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="sr-only">Undo</span>
            </Button>
          </div>
        )
      }

      if (ignoredChecks.has(checkId) && showIgnoredChecks) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-300">
              Ignored
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 h-6 px-2"
              onClick={() => {
                const newIgnoredChecks = new Set(ignoredChecks)
                newIgnoredChecks.delete(checkId)
                setIgnoredChecks(newIgnoredChecks)
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="sr-only">Undo</span>
            </Button>
          </div>
        )
      }

      // AI checks can be approved or ignored
      return (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:text-green-700 bg-transparent"
            onClick={() => {
              const newApprovedChecks = new Set(approvedChecks)
              newApprovedChecks.add(checkId)
              setApprovedChecks(newApprovedChecks)
            }}
          >
            <Check className="w-3 h-3" />
            <span className="sr-only">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-gray-600 hover:text-gray-700 bg-transparent"
            onClick={() => {
              const newIgnoredChecks = new Set(ignoredChecks)
              newIgnoredChecks.add(checkId)
              setIgnoredChecks(newIgnoredChecks)
            }}
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Ignore</span>
          </Button>
        </div>
      )
    } else {
      // Validation issues require fixes
      return (
        <div className="flex gap-1">
          <Badge variant="destructive" className="text-xs">
            Fix Required
          </Badge>
        </div>
      )
    }
  }

  const filterAIChecks = (checks: any[]) => {
    return checks.filter((check, index) => {
      if (!check.aiGenerated) return true
      const checkId = getCheckId(check, "general", index)
      return showIgnoredChecks || !ignoredChecks.has(checkId)
    })
  }

  const filterFigureAIChecks = (checks: any[], figureId: string) => {
    return checks.filter((check, index) => {
      if (!check.aiGenerated) return true
      const checkId = getCheckId(check, `figure-${figureId}`, index)
      return showIgnoredChecks || !ignoredChecks.has(checkId)
    })
  }

  const allQCChecks = manuscript ? [
    ...(Array.isArray(manuscript.qcChecks) ? manuscript.qcChecks : []),
    ...(Array.isArray(manuscript?.figures) ? manuscript.figures.flatMap((fig) =>
      (Array.isArray(fig.qcChecks) ? fig.qcChecks : []).map((check) => ({ ...check, figureId: fig.id, figureTitle: fig.title })),
    ) : []),
  ] : []

  const validationIssues = allQCChecks.filter((check) => !check.aiGenerated)
  const aiChecks = allQCChecks.filter((check) => check.aiGenerated)
  const errorCount = validationIssues.filter((check) => check.type === "error").length
  const warningCount = validationIssues.filter((check) => check.type === "warning").length

  const toggleOverlays = (figureId: string) => {
    setOverlayVisibility((prev) => ({
      ...prev,
      [figureId]: !prev[figureId],
    }))
  }

  const moveFigure = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= manuscript.figures.length) return

    const newFigures = [...manuscript.figures]
    const element = newFigures[fromIndex]
    newFigures.splice(fromIndex, 1)
    newFigures.splice(toIndex, 0, element)

    setManuscript((prev) => ({ ...prev, figures: newFigures }))
  }

  const movePanel = (figureIndex: number, panelIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= manuscript.figures[figureIndex].panels.length) return

    const newPanels = [...manuscript.figures[figureIndex].panels]
    const element = newPanels[panelIndex]
    newPanels.splice(panelIndex, 1)
    newPanels.splice(toIndex, 0, element)

    const newFigures = [...manuscript.figures]
    newFigures[figureIndex].panels = newPanels

    setManuscript((prev) => ({ ...prev, figures: newFigures }))
  }

  const [selectedSourceFiles, setSelectedSourceFiles] = useState<Set<string>>(new Set())
  const [sourceFileLinks, setSourceFileLinks] = useState<Record<string, string[]>>({})

  const allSubmittedFiles = [
    {
      id: "manuscript",
      name: "Main Manuscript",
      filename: "manuscript_v3.docx",
      type: "Manuscript",
      size: "2.4 MB",
      linkedTo: ["Manuscript"],
    },
    {
      id: "fig1",
      name: "Figure 1 - Protein Folding",
      filename: "figure_1_protein_folding.tiff",
      type: "Figure",
      size: "15.2 MB",
      linkedTo: ["Figure 1"],
    },
    {
      id: "fig1a",
      name: "Figure 1A Panel",
      filename: "fig1a_western_blot.tiff",
      type: "Panel",
      size: "8.1 MB",
      linkedTo: ["Figure 1A"],
    },
    {
      id: "fig1b",
      name: "Figure 1B Panel",
      filename: "fig1b_microscopy.tiff",
      type: "Panel",
      size: "12.3 MB",
      linkedTo: ["Figure 1B"],
    },
    {
      id: "fig1c",
      name: "Figure 1C Panel",
      filename: "fig1c_quantitative.tiff",
      type: "Panel",
      size: "6.7 MB",
      linkedTo: ["Figure 1C"],
    },
    {
      id: "fig2",
      name: "Figure 2 - UTP Binding",
      filename: "figure_2_utp_binding.tiff",
      type: "Figure",
      size: "18.5 MB",
      linkedTo: ["Figure 2"],
    },
    {
      id: "fig2a",
      name: "Figure 2A Panel",
      filename: "fig2a_structure.tiff",
      type: "Panel",
      size: "9.8 MB",
      linkedTo: ["Figure 2A"],
    },
    {
      id: "fig2b",
      name: "Figure 2B Panel",
      filename: "fig2b_binding_site.tiff",
      type: "Panel",
      size: "7.2 MB",
      linkedTo: ["Figure 2B"],
    },
    {
      id: "data1",
      name: "Western Blot Raw Data",
      filename: "western_blot_raw_data.xlsx",
      type: "Data",
      size: "1.8 MB",
      linkedTo: ["Figure 1A", "Figure 1"],
    },
    {
      id: "data2",
      name: "Microscopy Image Stack",
      filename: "microscopy_stack.zip",
      type: "Data",
      size: "245 MB",
      linkedTo: ["Figure 1B"],
    },
    {
      id: "data3",
      name: "Quantitative Analysis",
      filename: "quantitative_analysis.csv",
      type: "Data",
      size: "0.5 MB",
      linkedTo: ["Figure 1C"],
    },
    {
      id: "data4",
      name: "Protein Structure Data",
      filename: "protein_structure.pdb",
      type: "Data",
      size: "2.1 MB",
      linkedTo: ["Figure 2A"],
    },
    {
      id: "supp1",
      name: "Supplementary Data 1",
      filename: "supplementary_data_1.xlsx",
      type: "Supplementary",
      size: "3.2 MB",
      linkedTo: ["Manuscript"],
    },
    {
      id: "supp2",
      name: "Supplementary Methods",
      filename: "supplementary_methods.pdf",
      type: "Supplementary",
      size: "1.1 MB",
      linkedTo: ["Manuscript"],
    },
    {
      id: "appendix",
      name: "Statistical Analysis Appendix",
      filename: "statistical_appendix.pdf",
      type: "Appendix",
      size: "0.8 MB",
      linkedTo: ["Manuscript"],
    },
  ]

  const handleSourceFileSelection = (fileId: string) => {
    setSelectedSourceFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const handleSourceFileLinking = (fileId: string, linkTargets: string[]) => {
    setSourceFileLinks((prev) => ({
      ...prev,
      [fileId]: linkTargets,
    }))
  }

  const handleDeleteSelectedFiles = () => {
    // In a real app, this would delete the selected files
    console.log("[v0] Deleting selected files:", Array.from(selectedSourceFiles))
    setSelectedSourceFiles(new Set())
  }

  const getLinkingOptions = () => {
    const options = ["Manuscript"]
    manuscript.figures.forEach((fig) => {
      options.push(`Figure ${fig.id}`)
      fig.panels.forEach((panel) => {
        options.push(`Figure ${panel.id}`)
      })
    })
    return options
  }

  const [sourceDataFiles, setSourceDataFiles] = useState([
    { id: 1, name: "supplementary_data.xlsx", type: "xlsx", size: "2.3 MB" },
    { id: 2, name: "raw_data.csv", type: "csv", size: "1.8 MB" },
    { id: 3, name: "analysis_scripts.zip", type: "zip", size: "5.2 MB" },
  ])
  const [editFileDialog, setEditFileDialog] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const [availableFiles] = useState([
    { id: "manuscript", name: "manuscript.pdf", type: "pdf" },
    { id: "fig1", name: "figure1.tiff", type: "tiff" },
    { id: "fig1a", name: "figure1_panel_a.png", type: "png" },
    { id: "fig1b", name: "figure1_panel_b.png", type: "png" },
    { id: "fig2", name: "figure2.eps", type: "eps" },
    { id: "data1", name: "experimental_data.xlsx", type: "xlsx" },
    { id: "supp1", name: "supplementary_table1.xlsx", type: "xlsx" },
    { id: "appendix", name: "appendix_methods.docx", type: "docx" },
  ])

  const handleDownloadFile = (fileName: string) => {
    // Create a mock download - in real app this would fetch the actual file
    const link = document.createElement("a")
    link.href = `/api/files/download/${fileName}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log(`[v0] Downloading file: ${fileName}`)
  }

  const handleEditFile = (fileId: number) => {
    setSelectedFileId(fileId)
    setEditFileDialog(true)
  }

  const handleDeleteFile = (fileId: number) => {
    setSourceDataFiles((prev) => prev.filter((file) => file.id !== fileId))
    console.log(`[v0] Deleted file with ID: ${fileId}`)
  }

  const handleReplaceFile = (newFileName: string) => {
    if (selectedFileId) {
      setSourceDataFiles((prev) =>
        prev.map((file) => (file.id === selectedFileId ? { ...file, name: newFileName } : file)),
      )
    }
    setEditFileDialog(false)
    setSelectedFileId(null)
  }

  const handleUploadNewFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: file.name.split(".").pop() || "unknown",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      }
      setSourceDataFiles((prev) => [...prev, newFile])
      setEditFileDialog(false)
      setSelectedFileId(null)
    }
  }

  const ManuscriptReviewView = () => {
    const [selectedFigureIndex, setSelectedFigureIndex] = useState(0)
    const selectedFigure = manuscript?.figures?.[selectedFigureIndex]

    if (!manuscript?.figures || manuscript.figures.length === 0) {
      return (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-6 h-6" />
                Figures Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No figures available for this manuscript.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
    <div className="space-y-8">
        {/* Figures Section - Now First and Primary Focus */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-6 h-6" />
                Figures Review
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {manuscript?.figures?.length || 0} figure{(manuscript?.figures?.length || 0) !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFigure()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Figure
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* AI Checks Summary - Prominent Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">AI Quality Checks</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const allChecks = [
                        ...(Array.isArray(manuscript.qcChecks) ? manuscript.qcChecks : []),
                        ...(manuscript?.figures || []).flatMap(fig => fig.qcChecks || [])
                      ];
                      const aiChecks = allChecks.filter(check => check.aiGenerated);
                      const errors = aiChecks.filter(check => check.type === 'error').length;
                      const warnings = aiChecks.filter(check => check.type === 'warning').length;
                      const info = aiChecks.filter(check => check.type === 'info').length;
                      const dismissed = aiChecks.filter(check => check.dismissed).length;
                      
                      return (
                        <>
                          {errors > 0 && (
                            <Badge variant="destructive" className="text-sm px-2 py-1">
                              {errors} Errors
                            </Badge>
                          )}
                          {warnings > 0 && (
                            <Badge variant="secondary" className="text-sm px-2 py-1">
                              {warnings} Warnings
                            </Badge>
                          )}
                          {info > 0 && (
                            <Badge variant="outline" className="text-sm px-2 py-1">
                              {info} Info
                            </Badge>
                          )}
                          <span className="text-sm text-blue-700 font-medium">
                            {aiChecks.length} total AI checks
                          </span>
                          {dismissed > 0 && (
                            <span className="text-xs text-gray-500">
                              ({dismissed} dismissed)
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="text-sm text-blue-700">
                  AI-powered quality assessment for manuscript review
                </div>
              </div>
            </div>

            {/* AI Checks List */}
            {(() => {
              const allChecks = [
                ...(Array.isArray(manuscript.qcChecks) ? manuscript.qcChecks : []),
                ...(manuscript?.figures || []).flatMap(fig => fig.qcChecks || [])
              ];
              const aiChecks = allChecks.filter(check => check.aiGenerated);
              
              if (aiChecks.length === 0) return null;
              
              return (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">All AI Checks</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {aiChecks.map((check, index) => {
                      const checkId = getCheckId(check, "ai-quality", index);
                      const isIgnored = ignoredChecks.has(checkId);
                      const isApproved = approvedChecks.has(checkId);
                      
                      if (isIgnored && !showIgnoredChecks) return null;
                      
                      return (
                        <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${
                          isApproved ? 'bg-green-50 border-green-200' :
                          isIgnored ? 'bg-gray-50 border-gray-200 opacity-60' :
                          check.type === 'error' ? 'bg-red-50 border-red-200' :
                          check.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          {getQCIcon(check.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{check.message}</span>
                                {isApproved && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    <Check className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {isIgnored && (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                    <X className="w-3 h-3 mr-1" />
                                    Ignored
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {(check as any).figureTitle ? `Figure ${(check as any).figureTitle}` : 'General'}
                                </span>
                                {renderCheckActions(check, "ai-quality", index)}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                            {(check as any).panelId && (
                              <div className="text-xs text-gray-500 mt-1">
                                Panel: {(check as any).panelId}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Tab-based Figure Navigation */}
            {(manuscript?.figures?.length || 0) > 0 && (
              <div className="space-y-6">
                <div className="flex space-x-1 border-b border-gray-200 bg-gray-50 rounded-t-lg p-1">
                  {(manuscript?.figures || []).map((figure, index) => (
                    <button
                      key={figure.id}
                      onClick={() => setSelectedFigureIndex(index)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        selectedFigureIndex === index
                          ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Figure {index + 1}: {figure.title}
                    </button>
                  ))}
                </div>

                {/* Selected Figure Display */}
                {selectedFigure && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{selectedFigure.title}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowExpandedFigure(showExpandedFigure === selectedFigure.id ? null : selectedFigure.id)}
                        >
                          <ZoomIn className="w-4 h-4 mr-1" />
                          {showExpandedFigure === selectedFigure.id ? "Collapse" : "Expand"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFigure(selectedFigureIndex)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete figure"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Side-by-side Figure and Caption Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Figure Image */}
                      <div className="relative">
                        <img
                          src={(selectedFigure as any).fullImagePath || getFigureImage(manuscript?.title || '', selectedFigure.id, selectedFigure.title)}
                          alt={selectedFigure.title}
                          className={`w-full object-contain border rounded-lg ${
                            showExpandedFigure === selectedFigure.id ? "max-h-96" : "max-h-64"
                          }`}
                        />
                        
                        {/* AI Feedback Flags on Panels */}
                        {selectedFigure.panels.map((panel, panelIndex) => {
                          const panelChecks = (selectedFigure.qcChecks as any)?.filter((check: any) => 
                            check.panelId === panel.id
                          ) || []
                          const hasIssues = panelChecks.some((check: any) => check.status === 'failed' || check.status === 'warning')
                          
                          if (!hasIssues) return null
                          
                          return (
                            <div
                              key={panel.id}
                              className="absolute border-2 border-red-500 bg-red-500/20 rounded"
                              style={{
                                left: `${10 + (panelIndex % 2) * 45}%`,
                                top: `${10 + Math.floor(panelIndex / 2) * 40}%`,
                                width: "40%",
                                height: "35%",
                              }}
                            >
                              <div className="absolute -top-6 left-0 bg-red-500 text-white rounded px-2 py-1 text-xs font-bold shadow-sm">
                                {panel.description} - Issues
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Figure Caption and Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Figure Caption</h4>
                          <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded border text-sm">
                            {selectedFigure.legend || "No caption available for this figure."}
                          </div>
                        </div>

                        {/* Panel Details with Thumbnails */}
                        {selectedFigure.panels.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Panel Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                              {selectedFigure.panels.map((panel, panelIndex) => {
                                const panelChecks = (selectedFigure.qcChecks as any)?.filter((check: any) => 
                                  check.panelId === panel.id
                                ) || []
                                const linkedSourceData = (selectedFigure.linkedData as any)?.filter((data: any) => 
                                  data.panelId === panel.id
                                ) || []
                                
                                return (
                                  <div key={panel.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                                    {/* Panel Thumbnail */}
                                    <div className="relative mb-2">
                                      <div className="w-full h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded border flex items-center justify-center relative overflow-hidden">
                                        <img
                                          src={(panel as any).thumbnailPath || (panel as any).imagePath || getFigureImage(manuscript.title, selectedFigure.id, selectedFigure.title)}
                                          alt={`Panel ${panel.id}`}
                                          className="w-full h-full object-cover opacity-60"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <span className="text-white text-xs font-bold bg-black bg-opacity-70 px-2 py-1 rounded">
                                            {panel.id}
                                          </span>
                                        </div>
                                        {/* AI Feedback Flag */}
                                        {panelChecks.length > 0 && (
                                          <div className="absolute top-1 right-1">
                                            <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                              <Cpu className="w-2 h-2 text-white" />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Panel Info */}
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium text-gray-900">{panel.id}</div>
                                      <div className="text-xs text-gray-600 line-clamp-2">{panel.description}</div>
                                      
                                      {/* Panel Caption/Legend */}
                                      {(panel as any).legend && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                                          <div className="font-medium text-gray-800 mb-1">Caption:</div>
                                          <div className="line-clamp-3">{(panel as any).legend}</div>
                                        </div>
                                      )}
                                      
                                      {/* Status Badges */}
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {linkedSourceData.length > 0 && (
                                          <Badge variant="outline" className="text-xs px-1 py-0">
                                            📁 {linkedSourceData.length}
                                          </Badge>
                                        )}
                                        {panelChecks.length > 0 && (
                                          <Badge 
                                            variant={panelChecks.some((c: any) => c.status === 'failed') ? "destructive" : "secondary"}
                                            className="text-xs px-1 py-0"
                                          >
                                            <Cpu className="w-2 h-2 mr-1" />
                                            {panelChecks.length}
                                          </Badge>
                                        )}
                                        {panel.hasIssues && (
                                          <Badge variant="destructive" className="text-xs px-1 py-0">
                                            ⚠️ Issues
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manuscript-level Data - Now Secondary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-6 h-6" />
            Manuscript Data
          </CardTitle>
          <CardDescription>Data and information relating to the entire manuscript</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Link className="w-4 h-4" />
                Linked Data & Information
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLinkedDataForm({ type: "", identifier: "", url: "", description: "", isCustom: false })
                  setEditingLinkedDataIndex(null)
                  setIsEditingLinkedData(true)
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Data
              </Button>
            </div>

              {/* Convert to Table Format */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Database</th>
                      <th className="text-left p-2 font-medium">Identifier</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-left p-2 font-medium">URL</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
              {linkedData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm font-medium">{data.type}</td>
                        <td className="p-2 text-sm">{data.identifier}</td>
                        <td className="p-2 text-sm text-gray-600">{data.description}</td>
                        <td className="p-2 text-sm">
                          <a 
                            href={data.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                          >
                            {data.url}
                          </a>
                        </td>
                        <td className="p-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={data.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditLinkedData(index)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLinkedData(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>

            {isEditingLinkedData && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {editingLinkedDataIndex !== null ? "Edit" : "Add"} Linked Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Repository Type</Label>
                    <select
                      value={linkedDataForm.type}
                      onChange={(e) => {
                        const isCustom = e.target.value === "Custom"
                        setLinkedDataForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                          isCustom,
                          url: isCustom ? prev.url : "",
                        }))
                      }}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">Select repository...</option>
                      {repositories.map((repo) => (
                        <option key={repo.name} value={repo.name}>
                          {repo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Accession Number</Label>
                    <div>
                      <input
                        type="text"
                        value={linkedDataForm.identifier}
                        onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, identifier: e.target.value }))}
                        placeholder="Enter accession number..."
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {linkedDataForm.isCustom && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">URL</Label>
                      <div>
                        <input
                          type="url"
                          value={linkedDataForm.url}
                          onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, url: e.target.value }))}
                          placeholder="Enter full URL..."
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <div>
                      <input
                        type="text"
                        value={linkedDataForm.description}
                        onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the data..."
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {!linkedDataForm.isCustom && linkedDataForm.type && linkedDataForm.identifier && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Generated URL Preview</Label>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border font-mono">
                        {generateUrl(linkedDataForm.type, linkedDataForm.identifier)}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingLinkedData(false)
                        setEditingLinkedDataIndex(null)
                        setLinkedDataForm({ type: "", identifier: "", url: "", description: "", isCustom: false })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleLinkedDataSubmit}
                      disabled={
                        !linkedDataForm.type ||
                        !linkedDataForm.identifier ||
                        !linkedDataForm.description ||
                        (linkedDataForm.isCustom && !linkedDataForm.url)
                      }
                    >
                      {editingLinkedDataIndex !== null ? "Update" : "Add"} Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Source Data
                </div>
                <Button variant="outline" size="sm" onClick={handleAddSourceData}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add File
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sourceDataFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">{file.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(file.name)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditSourceData(sourceDataFiles.indexOf(file))}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isEditingSourceData && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {editingSourceDataIndex !== null ? "Edit" : "Add"} Source Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Name</Label>
                  <Input
                    value={sourceDataForm.filename}
                    onChange={(e) => setSourceDataForm(prev => ({ ...prev, filename: e.target.value }))}
                    placeholder="Enter filename"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Type</Label>
                  <Select
                    value={sourceDataForm.type}
                    onValueChange={(value) => setSourceDataForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="txt">Text (.txt)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                      <SelectItem value="zip">ZIP (.zip)</SelectItem>
                      <SelectItem value="pdb">PDB (.pdb)</SelectItem>
                      <SelectItem value="fastq">FASTQ (.fastq)</SelectItem>
                      <SelectItem value="fcs">FCS (.fcs)</SelectItem>
                      <SelectItem value="bed">BED (.bed)</SelectItem>
                      <SelectItem value="bw">BigWig (.bw)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Size</Label>
                  <Input
                    value={sourceDataForm.size}
                    onChange={(e) => setSourceDataForm(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="e.g., 2.3 MB"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload File (Optional)</Label>
                  <Input
                    type="file"
                    onChange={(e) => setSourceDataForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSourceDataSubmit}
                    disabled={!sourceDataForm.filename}
                  >
                    {editingSourceDataIndex !== null ? "Update" : "Add"} File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingSourceData(false)
                      setEditingSourceDataIndex(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Availability Statement
              </h3>
            </div>

            <p className="text-sm leading-relaxed">{dataAvailability}</p>
          </div>
        </CardContent>
      </Card>

      {/* General Manuscript Issues */}
      {(manuscript?.qcChecks?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                General Manuscript Issues
              </CardTitle>
              {ignoredChecks.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIgnoredChecks(!showIgnoredChecks)}
                  className="text-gray-600"
                >
                  <LucideEye className="w-4 h-4 mr-2" />
                  {showIgnoredChecks ? "Hide Ignored" : `View Ignored (${ignoredChecks.size})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Checks Section */}
            {(manuscript?.qcChecks || []).filter((check) => check.aiGenerated).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  AI Checks
                </Label>
                {(manuscript?.qcChecks || [])
                  .filter((check) => check.aiGenerated)
                  .map((check, checkIndex) => {
                    const checkId = getCheckId(check, "general", checkIndex)
                    const isIgnored = ignoredChecks.has(checkId)

                    if (isIgnored && !showIgnoredChecks) {
                      return null
                    }

                    return (
                      <div
                        key={checkIndex}
                        className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${isIgnored ? "opacity-60 bg-gray-50" : ""}`}
                      >
                        {getQCIcon(check.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{check.message}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                        </div>
                        {getQCActions(check, "general", checkIndex)}
                      </div>
                    )
                  })}
              </div>
            )}

            {/* QC Checks Section */}
            {(manuscript?.qcChecks || []).filter((check) => !check.aiGenerated).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  QC Checks
                </Label>
                {(manuscript?.qcChecks || [])
                  .filter((check) => !check.aiGenerated)
                  .map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      {getQCIcon(check.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{check.message}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                      </div>
                      {getQCActions(check, "general", checkIndex)}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
            </div>
  )
  }

  const ListReviewView = () => {
    const allQCChecks = [
      ...(Array.isArray(manuscript.qcChecks) ? manuscript.qcChecks : []).map((check) => ({ ...check, location: "General Manuscript" })),
      ...(manuscript?.figures || []).flatMap((fig) =>
        (Array.isArray(fig.qcChecks) ? fig.qcChecks : []).map((check) => ({ ...check, location: `Figure ${fig.id}`, figureTitle: fig.title })),
      ),
    ]

    const validationIssues = allQCChecks.filter((check) => !check.aiGenerated)
    const aiChecks = allQCChecks.filter((check) => check.aiGenerated)

    return (
      <div className="space-y-6">
        {/* QC Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              QC Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {validationIssues.filter((c) => c.type === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {validationIssues.filter((c) => c.type === "warning").length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                  <Cpu className="w-6 h-6" />
                  {aiChecks.length}
                </div>
                <div className="text-sm text-muted-foreground">AI Checks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {(manuscript?.figures || []).reduce((acc, fig) => acc + (fig.panels?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Panels</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                AI Checks
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
                {aiChecks.map((check, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    {getQCIcon(check.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                        <span className="font-medium">{check.message}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{check.location}</span>
                      {getQCActions(check, check.location, index)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
              </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!manuscript) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading manuscript details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>

        <div className="flex items-center gap-4">
          {currentEditor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {currentEditor.name} is currently editing
              {editingConflicts.hasConflicts && (
                <Button variant="link" size="sm" onClick={() => setShowConflictDetails(true)}>
                  Resolve Conflicts
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{manuscript.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{manuscript.status}</Badge>
              <Badge variant="secondary">{(manuscript as any).workflowState || 'In Review'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Authors</Label>
              <p className="text-sm">{manuscript.authors}</p>
            </div>
            <div>
              <Label>DOI</Label>
              <p className="text-sm">{manuscript.doi}</p>
            </div>
            <div>
              <Label>Received Date</Label>
              <p className="text-sm">{manuscript.received}</p>
            </div>
            <div>
              <Label>Assigned To</Label>
              <p className="text-sm">{manuscript.assignedTo}</p>
            </div>
            <div>
              <Label>Modified By</Label>
              <p className="text-sm">{manuscript.modifiedBy}</p>
            </div>
          </div>

          <Tabs defaultValue={selectedView} className="w-full">
            <TabsList>
              <TabsTrigger value="manuscript" onClick={() => setSelectedView("manuscript")}>
                Manuscript Review
              </TabsTrigger>
              <TabsTrigger value="list" onClick={() => setSelectedView("list")}>
                List Review
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manuscript">
              <ManuscriptReviewView />
            </TabsContent>
            <TabsContent value="list">
              <ListReviewView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Export the component
export default ManuscriptDetail
export { ManuscriptDetail }
