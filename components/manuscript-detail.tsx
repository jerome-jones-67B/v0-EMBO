"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"
import { endpoints, config } from "@/lib/config"
import { getImageUrl } from "@/lib/image-utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
  FileText,
  ExternalLink,
  Link,
  LucideEye,
  ZoomIn,
  ChevronUp,
  ChevronDown,
  Download,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock,
  Check,
  RotateCcw,
  Database,
  UserPlus,
  UserMinus,
  Send,
} from "lucide-react"
import { mockLinkedData, mockSourceData } from "@/lib/mock"
import { dataService } from "@/lib/data-service"
import { getStatusMapping } from "@/lib/status-mapping"
import { 
  getQCIcon, 
  getCheckId,
} from "./manuscript-detail-utils"
import { FullTextView } from "./manuscript-full-text-view"
import { ManuscriptLoadingScreen } from "./manuscript-loading-screen"
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
import { AuthorList } from "./author-list"

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
    const response = await dataService.getManuscriptById(msid)
    if (response.success && response.data) {
      return response.data
    }
  } catch (error) {
    console.error('❌ Error fetching manuscript from data service:', error)
  }
  
  // Fallback to mock data if data service fails
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
  figures: (manuscriptData as any).figures || (() => {
    // Generate varied figure data based on manuscript ID
    const baseId = parseInt(manuscriptData.id.split('-')[2]) || 1;
    const figureCount = 1 + (baseId % 3); // 1-3 figures per manuscript
    const figures: any[] = [];
    
    for (let i = 1; i <= figureCount; i++) {
      const panelCount = 2 + ((baseId + i) % 4); // 2-5 panels per figure
      const panels: any[] = [];
      
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
  // linkedData is already defined above in the dynamic section
  }
  
  return finalManuscript
}

// Helper function to build full API URLs
const buildApiUrl = (endpoint: string): string => {
  // Always use relative paths to avoid CORS issues between different Vercel deployments
  const baseUrl = config.api.baseUrl.startsWith('http') ? '/api' : config.api.baseUrl
  return `${baseUrl}${endpoint}`
}


const ManuscriptDetail = ({ msid, onBack, useApiData }: ManuscriptDetailProps) => {
  const { data: session } = useSession()
  const [selectedView, setSelectedView] = useState<"manuscript" | "list" | "fulltext">("manuscript")
  const [selectedFigureIndex, setSelectedFigureIndex] = useState(0)
  const [linkedData, setLinkedData] = useState(mockLinkedData)
  const [sourceData, setSourceData] = useState(mockSourceData)
  const [editingLinkedData, setEditingLinkedData] = useState<string | null>(null)
  const [editingSourceData, setEditingSourceData] = useState<string | null>(null)
  const [showExpandedFigure, setShowExpandedFigure] = useState<string | null>(null)
  const [overlayVisibility, setOverlayVisibility] = useState<Record<string, boolean>>({})
  const [manuscript, setManuscript] = useState<any>(undefined)
  const [notes, setNotes] = useState("")
  const [dataAvailability, setDataAvailability] = useState("")
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null)
  const [showPanelPopup, setShowPanelPopup] = useState<{ panelId: string; position: { x: number; y: number } } | null>(null)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [isDetailLoadComplete, setIsDetailLoadComplete] = useState(false)
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
  const [fullTextContent, setFullTextContent] = useState<string>("")
  const [isLoadingFullText, setIsLoadingFullText] = useState(false)
  const [fullTextError, setFullTextError] = useState<string | null>(null)
  const [fullTextMetadata, setFullTextMetadata] = useState<any>(null)
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  // Track actual image load status per figure (figureId -> 'api' | 'fallback' | 'loading')
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, 'api' | 'fallback' | 'loading'>>({})
  // Track permanently failed images to prevent continuous retrying
  const [permanentlyFailedImages, setPermanentlyFailedImages] = useState<Set<string>>(new Set())
  // Track active image requests to prevent duplicates
  const activeImageRequests = useRef<Set<string>>(new Set())
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
  const [assignmentAccordionOpen, setAssignmentAccordionOpen] = useState(false)
  const [notesAccordionOpen, setNotesAccordionOpen] = useState(false)

  // Add ref to prevent multiple simultaneous API calls
  const [isFetching, setIsFetching] = useState(false)
  
  // Fetch API data for manuscript details (memoized to prevent recreation)
  const fetchApiManuscriptDetail = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      return
    }
    
    setIsFetching(true)
    setIsLoadingApi(true)
    
    // Check if we should bypass auth or if we have a session
    const shouldBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" || process.env.NODE_ENV === "development"
    if (!session && !shouldBypass) {
      setIsLoadingApi(false)
      setIsFetching(false)
      return
    }
    
    try {
      const response = await fetch(`${buildApiUrl(endpoints.manuscriptDetails(msid))}?apiMode=true`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`API request failed: ${response.status} - ${errorData.error || response.statusText}`)
      }
      const apiData: any = await response.json()
      
      // Check if this is an error response from API mode
      if (apiData.error && apiData.isApiMode) {
        throw new Error(`Data4Rev API Error: ${apiData.error} - ${apiData.details}`)
      }
      
      // Fetch validation data separately
      let validationData: any = null;
      try {
        const validationResponse = await fetch(`/api/v1/manuscripts/${msid}/validation`);
        if (validationResponse.ok) {
          validationData = await validationResponse.json();
        }
      } catch (validationError) {
        console.warn('Failed to fetch validation data:', validationError);
      }

      // Transform API data to match our manuscript format
      const statusMapping = getStatusMapping(apiData.status)
      
      // Helper function to add validation checks to figure
      const addValidationChecksToFigure = (figure: any, figureIndex: number, validationData: any) => {
        let figureChecks = (figure.check_results || []).map((check: any) => ({
          type: check.status === 'error' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
          message: check.message || check.check_name || 'No message',
          details: check.details || check.message || check.check_name || 'No details available',
          aiGenerated: check.ai_generated !== undefined ? check.ai_generated : true,
          dismissed: false,
          figureTitle: figure.label || `Figure ${figure.id}`,
          panelId: check.panel_id || null
        }));

        // Add figure-level validation checks if available
        if (validationData && !validationData.fallback && validationData.figures) {
          const figureValidation = validationData.figures.find((f: any, index: number) => 
            f.label === figure.label || index === figureIndex
          );
          
          if (figureValidation) {
            // Add figure label checks
            if (figureValidation.label && Array.isArray(figureValidation.label)) {
              figureValidation.label.forEach((check: any) => {
                figureChecks.push({
                  type: check.status === 'failed' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
                  message: check.message || check.check_name || 'Figure label validation',
                  details: check.details || check.message || 'Figure label validation details',
                  aiGenerated: true,
                  dismissed: false,
                  figureTitle: figure.label || `Figure ${figure.id}`,
                  validationSource: 'figure-label',
                  id: check.id
                });
              });
            }
            
            // Add figure image checks
            if (figureValidation.image && Array.isArray(figureValidation.image)) {
              figureValidation.image.forEach((check: any) => {
                figureChecks.push({
                  type: check.status === 'failed' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
                  message: check.message || check.check_name || 'Figure image validation',
                  details: check.details || check.message || 'Figure image validation details',
                  aiGenerated: true,
                  dismissed: false,
                  figureTitle: figure.label || `Figure ${figure.id}`,
                  validationSource: 'figure-image',
                  id: check.id
                });
              });
            }

            // Add figure links checks
            if (figureValidation.links && Array.isArray(figureValidation.links)) {
              figureValidation.links.forEach((linkChecks: any[]) => {
                if (Array.isArray(linkChecks)) {
                  linkChecks.forEach((check: any) => {
                    figureChecks.push({
                      type: check.status === 'failed' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
                      message: check.message || check.check_name || 'Figure link validation',
                      details: check.details || check.message || 'Figure link validation details',
                      aiGenerated: true,
                      dismissed: false,
                      figureTitle: figure.label || `Figure ${figure.id}`,
                      validationSource: 'figure-links',
                      id: check.id
                    });
                  });
                }
              });
            }
          }
        }

        return figureChecks;
      };

      // Transform API data structure to UI structure
      const transformedFigures = (apiData.figures || []).map((figure: any, figureIndex: number) => ({
        ...figure,
        // Ensure UI-expected fields are mapped correctly
        title: figure.label || figure.title || `Figure ${figure.id}`, // API uses 'label', UI expects 'title'
        legend: figure.caption || figure.legend || '', // API uses 'caption', UI expects 'legend'
        // Add image URLs using our image serving system - these will be overridden in JSX for real-time URL generation
        fullImagePath: null, // Always generate fresh URLs in JSX to prevent caching API URLs
        thumbnailPath: null, // Always generate fresh URLs in JSX to prevent caching API URLs
        imageSource: useApiData ? 'api' : 'placeholder',
        // Ensure panels have linkedData arrays for source data links
        panels: (figure.panels || []).map((panel: any) => ({
          ...panel,
          id: panel.label || panel.id, // Ensure panel ID matches expected format (A, B, C, etc.)
          description: panel.caption || panel.description || '', // Map caption to description
          // Add panel-specific image URLs - these will be overridden in JSX for real-time URL generation
          imagePath: null, // Always generate fresh URLs in JSX to prevent caching API URLs
          thumbnailPath: null, // Always generate fresh URLs in JSX to prevent caching API URLs
          linkedData: panel.source_data || [],
          qcChecks: (panel.check_results || []).map((check: any) => ({
            type: check.status === 'error' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
            message: check.message || check.check_name || 'No message',
            details: check.details || check.message || check.check_name || 'No details available',
            aiGenerated: check.ai_generated !== undefined ? check.ai_generated : true,
            dismissed: false,
            panelId: panel.label || panel.id
          }))
        })),
        // Transform check_results to qcChecks format and integrate validation data
        qcChecks: addValidationChecksToFigure(figure, figureIndex, validationData),
        // Transform links to linkedData format
        linkedData: (figure.links || []).map((link: any) => ({
          type: link.database || 'Repository',
          identifier: link.identifier,
          url: link.uri,
          description: link.name
        }))
      }))
      
      // Transform manuscript-level check_results to qcChecks
      let transformedQcChecks = (apiData.check_results || []).map((check: any) => ({
        type: check.status === 'error' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
        message: check.message || check.check_name || 'No message',
        details: check.details || check.message || check.check_name || 'No details available',
        aiGenerated: check.ai_generated !== undefined ? check.ai_generated : true,
        dismissed: false,
        manuscriptLevel: true // Flag to distinguish manuscript-level checks
      }));

      // Integrate validation data if available (for manuscript-level checks)
      if (validationData && !validationData.fallback) {
        const validationChecks: any[] = [];
        
        // Process manuscript-level validation checks
        if (validationData.links && Array.isArray(validationData.links)) {
          validationData.links.forEach((linkChecks: any[]) => {
            if (Array.isArray(linkChecks)) {
              linkChecks.forEach((check: any) => {
                validationChecks.push({
                  type: check.status === 'failed' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
                  message: check.message || check.check_name || 'Validation check',
                  details: check.details || check.message || 'Validation details',
                  aiGenerated: true,
                  dismissed: false,
                  manuscriptLevel: true,
                  validationSource: 'links',
                  id: check.id
                });
              });
            }
          });
        }
        
        // Add validation checks to transformed checks
        transformedQcChecks = [...transformedQcChecks, ...validationChecks];
      }

      // Validation logging for data transformation (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 API Data Transformation Validation')
        console.log('Raw API data:', apiData)
        console.log('Validation data:', validationData)
        console.log('Transformed figures:', transformedFigures)
        console.log('Figure count:', transformedFigures.length)
        
        // Enhanced figure logging
        transformedFigures.forEach((fig: any, index: number) => {
          console.log(`Figure ${index + 1} (${fig.id}):`, {
            title: fig.title,
            legend: fig.legend?.substring(0, 50) + '...',
            panelCount: fig.panels?.length || 0,
            checkCount: fig.qcChecks?.length || 0,
            hasRealCoordinates: fig.panels?.some((p: any) => p.x1 !== null && p.y1 !== null),
            validationIntegrated: fig.qcChecks?.some((c: any) => c.validationSource)
          })
        })
        
        console.log('Transformed QC checks:', transformedQcChecks)
        console.log('Check summary:', {
          total: transformedQcChecks.length,
          aiGenerated: transformedQcChecks.filter((c: any) => c.aiGenerated).length,
          manual: transformedQcChecks.filter((c: any) => !c.aiGenerated).length,
          fromValidation: transformedQcChecks.filter((c: any) => c.validationSource).length,
          manuscriptLevel: transformedQcChecks.filter((c: any) => c.manuscriptLevel).length
        })
        
        console.log('Image serving summary:', {
          figuresWithImages: transformedFigures.filter((f: any) => f.fullImagePath).length,
          imageSource: useApiData ? 'api-serving' : 'placeholder-fallback',
          panelsWithImages: transformedFigures.reduce((acc: number, fig: any) => 
            acc + (fig.panels?.filter((p: any) => p.imagePath).length || 0), 0
          ),
          sampleUrls: transformedFigures.slice(0, 2).map((f: any) => ({
            figureId: f.id,
            fullImage: f.fullImagePath,
            thumbnail: f.thumbnailPath
          }))
        })
        
        // Panel coordinate validation
        const panelsWithCoords = transformedFigures.flatMap((fig: any) => 
          fig.panels?.filter((p: any) => p.x1 !== null && p.y1 !== null) || []
        );
        console.log('Panels with real coordinates:', panelsWithCoords.length, '/', 
          transformedFigures.reduce((acc: number, fig: any) => acc + (fig.panels?.length || 0), 0)
        );
        
        console.groupEnd()
      }

      const transformedManuscript = {
        id: apiData.id,
        title: apiData.title,
        authors: typeof apiData.authors === 'string' ? apiData.authors.split(',').map((author: any) => author.trim()) : apiData.authors,
        received: apiData.received_at.split('T')[0],
        doi: apiData.doi,
        lastModified: apiData.received_at,
        status: apiData.status,
        assignedTo: "Dr. Sarah Wilson", // Not available in API - TODO: Implement assignment system
        currentStatus: statusMapping.displayStatus,
        modifiedBy: "Dr. Sarah Chen", // Not available in API - TODO: Add modification tracking
        priority: statusMapping.priority,
        // Properly map API fields
        journal: apiData.journal || "Journal not specified",
        accessionNumber: apiData.accession_number || null,
        errors: apiData.errors || null,
        abstract: apiData.note || "No abstract available",
        notes: apiData.note || "No additional notes", // TODO: Separate from abstract
        dataAvailability: "Available", // Not available in API - TODO: Add data availability tracking
        figures: transformedFigures,
        files: apiData.files || [],
        links: apiData.links || [],
        checkResults: apiData.check_results || [],
        sourceData: apiData.source_data || [],
        depositionEvents: apiData.deposition_events || [],
        // UI-specific fields
        displayStatus: statusMapping.displayStatus,
        workflowState: statusMapping.workflowState,
        badgeVariant: statusMapping.badgeVariant,
        isMapped: statusMapping.isMapped,
        unmappedFields: ['assignedTo', 'modifiedBy', 'dataAvailability'], // Fields not available in API - requires backend assignment/tracking system
        // Transform check_results to qcChecks format
        qcChecks: transformedQcChecks,
        // Add fallback indicator if present
        fallback: apiData.fallback || false
      }
      
      setManuscript(transformedManuscript as any)
      setNotes(transformedManuscript.notes)
      setDataAvailability(transformedManuscript.dataAvailability)
    } catch (error) {
      console.error('Failed to fetch API manuscript details:', error)
      
      // In API mode, show error information instead of falling back
      setManuscript({
        id: msid,
        title: `API Error: Failed to load manuscript ${msid}`,
        authors: [],
        received: new Date().toISOString().split('T')[0],
        doi: '',
        lastModified: new Date().toISOString(),
        status: 'api-error',
        displayStatus: 'API Error',
        workflowState: 'no-pipeline-results',
        priority: 'high',
        error: error instanceof Error ? error.message : String(error),
        isApiError: true,
        figures: [],
        abstract: `Failed to fetch manuscript data from Data4Rev API: ${error instanceof Error ? error.message : String(error)}`,
        notes: `API Error: ${error instanceof Error ? error.message : String(error)}`,
        dataAvailability: 'Data unavailable due to API error',
        qcChecks: [],
        links: [],
        sourceData: [],
        depositionEvents: []
      })
      setNotes(`API Error: ${error instanceof Error ? error.message : String(error)}`)
      setDataAvailability('Data unavailable due to API error')
    } finally {
      setIsLoadingApi(false)
      setIsFetching(false) // Reset fetching state
      setIsDetailLoadComplete(true)
    }
  }, [msid, session]) // Dependencies for useCallback - don't include isFetching as it changes within the function

  // Fetch full text content from API
  const fetchFullTextContent = async () => {
    if (!useApiData) {
      setFullTextError("Full text viewing is only available when using API data")
      return
    }

    // Check if we should bypass auth or if we have a session
    const shouldBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" || process.env.NODE_ENV === "development"
    if (!session && !shouldBypass) {
      setFullTextError("Authentication required to fetch full text content")
      return
    }

    setIsLoadingFullText(true)
    setFullTextError(null)
    
    try {
      const response = await fetch(`/api/v1/manuscripts/${msid}/content`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Always set content if it exists, regardless of fallback status
      if (data.content) {
        setFullTextContent(typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2))
        setFullTextError(null)
        setFullTextMetadata({
          source: data.source,
          contentType: data.content_type,
          wordCount: data.word_count,
          fallback: data.fallback
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📄 Full text content loaded:', {
            source: data.source,
            contentType: data.content_type,
            wordCount: data.word_count,
            fallback: data.fallback
          });
        }
      } else {
        setFullTextError(data.error || "No content available")
        setFullTextContent("")
        setFullTextMetadata(null)
        
        if (process.env.NODE_ENV === 'development') {
          console.warn('📄 Full text content failed:', data.source || 'unknown');
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching full text content:', error)
      setFullTextError("Failed to load full text content. Please try again.")
      setFullTextContent("")
      setFullTextMetadata(null)
    } finally {
      setIsLoadingFullText(false)
    }
  }

  // Load manuscript data when component mounts or when data source/msid changes
  useEffect(() => {
    setIsDetailLoadComplete(false) // Reset load state when switching
    
    // Initialize image load status when switching modes or manuscripts
    setImageLoadStatus({})
    // Clear permanently failed images when switching manuscripts/modes
    setPermanentlyFailedImages(new Set())
    // Clear active requests to prevent stale request tracking
    activeImageRequests.current.clear()
    
    if (useApiData) {
      // Load from API
      fetchApiManuscriptDetail()
    } else {
      // Load mock data
      const loadMockData = async () => {
        try {
          const manuscriptData = await getManuscriptDetail(msid)
          setManuscript(manuscriptData)
          setNotes((manuscriptData as any)?.notes || "")
          setDataAvailability((manuscriptData as any)?.dataAvailability || "")
          setNotesValue((manuscriptData as any)?.notes || "")
          setIsDetailLoadComplete(true)
        } catch (error) {
          console.error('Error loading mock manuscript:', error)
          setIsDetailLoadComplete(true) // Still mark as complete to prevent infinite loading
        }
      }
      loadMockData()
    }
  }, [useApiData, msid]) // Only depend on these two values

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
      title: (figure as any).label || figure.title || '',
      caption: (figure as any).caption || figure.legend || '',
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

    setManuscript((prev: any) => ({ ...prev, figures: updatedFigures }))

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

    setManuscript((prev: any) => ({ ...prev, figures: updatedFigures }))

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

    setManuscript((prev: any) => ({ ...prev, figures: updatedFigures }))
    setIsEditingFigure(false)
    setEditingFigure(null)
  }

  const handleAddFigure = async () => {
    if (!manuscript) return

    const newFigureData = {
      label: `Figure ${(manuscript.figures?.length || 0) + 1}`,
      caption: "Enter figure caption here...",
      sort_order: (manuscript.figures?.length || 0) + 1,
      panels: [
        {
          label: "A",
          caption: "Panel A description",
          x1: null,
          y1: null,
          x2: null,
          y2: null,
          confidence: null,
          sort_order: 1,
          source_data: [],
          links: []
        }
      ],
      links: [],
      source_data: []
    }

    try {
      // Use API to create figure if using API data
      if (useApiData) {
        const response = await fetch(`/api/v1/manuscripts/${msid}/figures`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newFigureData)
        });

        if (response.ok) {
          const createdFigure = await response.json();
          
          // Refresh manuscript data to get the updated figure list
          await fetchApiManuscriptDetail();
          
          console.log('✅ Figure created via API:', createdFigure);
          return;
        } else {
          console.warn('❌ API figure creation failed, falling back to mock');
        }
      }

      // Fallback to mock figure creation
      const newFigure = {
        id: `figure-${Date.now()}`,
        title: newFigureData.label,
        legend: newFigureData.caption,
        sort_order: newFigureData.sort_order,
        panels: [
          {
            id: "A",
            description: "Panel A description",
            linkedData: [],
            qcChecks: []
          }
        ],
        links: [],
        source_data: [],
        check_results: [],
        linkedData: [],
        qcChecks: []
      }

      setManuscript((prev: any) => ({
        ...prev,
        figures: [...prev.figures, newFigure],
      }))
      
    } catch (error) {
      console.error('Error creating figure:', error);
      alert('Failed to create figure. Please try again.');
    }
  }

  const handleDeleteFigure = async (figureIndex: number) => {
    if (!manuscript?.figures || figureIndex < 0 || figureIndex >= manuscript.figures.length) return

    const figureToDelete = manuscript.figures[figureIndex];
    
    if (window.confirm(`Are you sure you want to delete ${figureToDelete.title || figureToDelete.label}?`)) {
      try {
        // Use API to delete figure if using API data and figure has an ID
        if (useApiData && figureToDelete.id && !String(figureToDelete.id).startsWith('figure-')) {
          const response = await fetch(`/api/v1/manuscripts/${msid}/figures/${figureToDelete.id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Refresh manuscript data to get the updated figure list
            await fetchApiManuscriptDetail();
            
            console.log('✅ Figure deleted via API');
            return;
          } else {
            console.warn('❌ API figure deletion failed, falling back to local removal');
          }
        }

        // Fallback to local removal
        setManuscript((prev: any) => ({
          ...prev,
          figures: prev.figures.filter((_: any, index: number) => index !== figureIndex),
        }))
        
      } catch (error) {
        console.error('Error deleting figure:', error);
        alert('Failed to delete figure. Please try again.');
      }
    }
  }

  const handleSaveNotes = () => {
    setIsEditingNotes(false)
    // Update the manuscript object and local state
    if (manuscript) {
    manuscript.notes = notesValue
    }
    setNotes(notesValue) // Also update the notes state to trigger the useEffect
  }

  const handleDepositToBioStudies = async () => {
    if (!manuscript?.id) {
      setDepositError("No manuscript ID available for deposit")
      return
    }

    setIsDepositing(true)
    setDepositError(null)

    try {
      const response = await fetch(`/api/v1/manuscripts/${manuscript.id}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Update manuscript status to deposited
      setManuscript((prev: any) => ({
        ...prev,
        status: 'deposited',
        displayStatus: 'Deposited',
        workflowState: 'deposited-to-biostudies',
        badgeVariant: 'outline',
        lastModified: new Date().toISOString(),
        depositResult: result
      }))

      // Show success message
      alert('Manuscript successfully deposited to BioStudies!')
      
    } catch (error) {
      console.error('Deposit failed:', error)
      setDepositError(error instanceof Error ? error.message : 'Failed to deposit manuscript')
    } finally {
      setIsDepositing(false)
    }
  }

  // Auto-save changes to manuscript data (with debounce to prevent excessive updates)
  useEffect(() => {
    if (!manuscript) return
    
    const timer = setTimeout(() => {
      // Only save if the current values differ from the manuscript
      if (
        notes !== manuscript?.notes ||
        dataAvailability !== manuscript?.dataAvailability ||
        linkedData !== manuscript?.linkedData
      ) {
        // Update manuscript without triggering re-fetch
        // Note: This doesn't change msid or useApiData, so won't trigger the first useEffect
        setManuscript((prev: any) => ({
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
  }, [notes, dataAvailability, linkedData])

  // Handle fulltext fetching when selectedView changes to "fulltext"
  useEffect(() => {
    if (selectedView === "fulltext" && useApiData && !fullTextContent && !fullTextError) {
      fetchFullTextContent()
    }
  }, [selectedView, useApiData, fullTextContent, fullTextError, fetchFullTextContent])

  // Reset selected figure index when manuscript changes or when figures are not available
  useEffect(() => {
    const figuresCount = manuscript?.figures?.length || 0
    if (selectedFigureIndex >= figuresCount && figuresCount > 0) {
      setSelectedFigureIndex(0)
    } else if (figuresCount === 0) {
      setSelectedFigureIndex(0)
    }
  }, [manuscript?.figures?.length, selectedFigureIndex])

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

  const [approvedChecks, setApprovedChecks] = useState(new Set<string>())
  const [ignoredChecks, setIgnoredChecks] = useState(new Set<string>())
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

  // Memoize filter functions to prevent recreating on every render
  const filterAIChecks = useCallback((checks: any[]) => {
    return checks.filter((check: any, index: any) => {
      if (!check.aiGenerated) return true
      const checkId = getCheckId(check, "general", index)
      return showIgnoredChecks || !ignoredChecks.has(checkId)
    })
  }, [showIgnoredChecks, ignoredChecks])

  const filterFigureAIChecks = useCallback((checks: any[], figureId: string) => {
    return checks.filter((check: any, index: any) => {
      if (!check.aiGenerated) return true
      const checkId = getCheckId(check, `figure-${figureId}`, index)
      return showIgnoredChecks || !ignoredChecks.has(checkId)
    })
  }, [showIgnoredChecks, ignoredChecks])

  // Memoize expensive QC checks computations to prevent constant re-renders
  const allQCChecks = useMemo(() => manuscript ? [
    ...(Array.isArray(manuscript.qcChecks) ? manuscript.qcChecks : []),
    ...(Array.isArray(manuscript.figures) ? manuscript.figures.flatMap((fig: any) =>
      (Array.isArray(fig.qcChecks) ? fig.qcChecks : []).map((check: any) => ({ ...check, figureId: fig.id, figureTitle: fig.title })),
    ) : []),
  ] : [], [manuscript?.qcChecks, manuscript?.figures])

  const validationIssues = useMemo(() => 
    allQCChecks.filter((check) => !check.aiGenerated), [allQCChecks]
  )
  
  const aiChecks = useMemo(() => 
    allQCChecks.filter((check) => check.aiGenerated), [allQCChecks]
  )
  
  const errorCount = useMemo(() => 
    validationIssues.filter((check) => check.type === "error").length, [validationIssues]
  )
  
  const warningCount = useMemo(() => 
    validationIssues.filter((check) => check.type === "warning").length, [validationIssues]
  )

  // Memoize filtered AI checks for ManuscriptReviewView
  const visibleAiChecks = useMemo(() => 
    aiChecks.filter((check: any) => showIgnoredChecks || !ignoredChecks.has(getCheckId(check, "ai-quality", 0))), 
    [aiChecks, showIgnoredChecks, ignoredChecks]
  )

  const toggleOverlays = (figureId: string) => {
    setOverlayVisibility((prev) => ({
      ...prev,
      [figureId]: !prev[figureId],
    }))
  }

  const moveFigure = (fromIndex: number, toIndex: number) => {
    if (!manuscript.figures || toIndex < 0 || toIndex >= manuscript.figures.length) return

    const newFigures = [...manuscript.figures]
    const element = newFigures[fromIndex]
    newFigures.splice(fromIndex, 1)
    newFigures.splice(toIndex, 0, element)

    setManuscript((prev: any) => ({ ...prev, figures: newFigures }))
  }

  const movePanel = (figureIndex: number, panelIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= manuscript.figures[figureIndex].panels.length) return

    const newPanels = [...manuscript.figures[figureIndex].panels]
    const element = newPanels[panelIndex]
    newPanels.splice(panelIndex, 1)
    newPanels.splice(toIndex, 0, element)

    const newFigures = [...manuscript.figures]
    newFigures[figureIndex].panels = newPanels

    setManuscript((prev: any) => ({ ...prev, figures: newFigures }))
  }

  const [selectedSourceFiles, setSelectedSourceFiles] = useState<Set<string>>(new Set())
  const [sourceFileLinks, setSourceFileLinks] = useState<Record<string, string[]>>({})
  const [sourceDataFiles, setSourceDataFiles] = useState<any[]>([])
  const [isLoadingSourceData, setIsLoadingSourceData] = useState(false)
  const [sourceDataError, setSourceDataError] = useState<string | null>(null)

  // Fetch source data files from download API
  const fetchSourceDataFiles = useCallback(async () => {
    if (!msid) return
    
    setIsLoadingSourceData(true)
    setSourceDataError(null)
    
    try {
      const response = await fetch(`/api/v1/manuscripts/${msid}/download?format=list`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch source data: ${response.status}`)
      }
      
      const data = await response.json()
      setSourceDataFiles(data.files || [])
      
    } catch (error) {
      console.error('Error fetching source data:', error)
      setSourceDataError(error instanceof Error ? error.message : 'Unknown error')
      // Fallback to mock data on error
      setSourceDataFiles([])
    } finally {
      setIsLoadingSourceData(false)
    }
  }, [msid])

  // Fetch source data when List Review tab is selected
  useEffect(() => {
    if (useApiData && selectedView === "list" && sourceDataFiles.length === 0 && !isLoadingSourceData) {
      console.log('🔍 List Review tab selected - fetching source data files for:', msid)
      fetchSourceDataFiles()
    }
  }, [fetchSourceDataFiles, useApiData, selectedView, sourceDataFiles.length, isLoadingSourceData, msid])

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
    setSelectedSourceFiles(new Set())
  }

  const getLinkingOptions = () => {
    const options = ["Manuscript"]
    if (manuscript.figures) {
      manuscript.figures.forEach((fig: any) => {
        options.push(`Figure ${fig.id}`)
        fig.panels.forEach((panel: any) => {
          options.push(`Figure ${panel.id}`)
        })
      })
    }
    return options
  }

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
  }

  const handleEditFile = (fileId: number) => {
    setSelectedFileId(fileId)
    setEditFileDialog(true)
  }

  const handleDeleteFile = (fileId: number) => {
    setSourceDataFiles((prev) => prev.filter((file) => file.id !== fileId))
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

  // Memoize ManuscriptReviewView component to prevent unnecessary re-renders
  const ManuscriptReviewView = React.memo(() => {
    // Use manuscript.figures directly instead of local state to avoid render loops
    const figuresData = manuscript?.figures || []
    const selectedFigure = figuresData?.[selectedFigureIndex]

    // Memoize panel click handler to prevent re-renders
    const handlePanelClick = useCallback((panelId: string) => {
      setShowPanelPopup({panelId, position: { x: 0, y: 0 }})
    }, [])

    // Memoize figure selection handlers - removed automatic tab switching
    const handleFigureSelect = useCallback((index: number) => {
      setSelectedFigureIndex(index);
      // Note: Removed automatic setSelectedView("manuscript") to prevent unwanted tab switching
    }, [])

    // Memoize simple figure index selection
    const handleFigureIndexSelect = useCallback((index: number) => {
      setSelectedFigureIndex(index);
    }, [])

    if (!figuresData || figuresData.length === 0) {
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
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground mb-2">
                  {useApiData ? 
                    "No figures found in API data for this manuscript." : 
                    "No figures available for this manuscript."
                  }
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {useApiData 
                    ? "Check if the manuscript includes figure data in the API response."
                    : "Add figures to start the review process."
                  }
                </p>
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
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="w-6 h-6" />
                Figures Review
              </CardTitle>
          </CardHeader>
          <CardContent>

            {/* Source Data Accordion - Moved to Top */}
            <Accordion type="single" collapsible className="w-full mb-8">
              <AccordionItem value="source-data">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      <span className="font-semibold">Source Data ({sourceDataFiles.length} files)</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={handleAddSourceData}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add File
                      </Button>
                    </div>
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Figure Tabs Navigation */}
            {figuresData.length > 0 && (
              <div className="space-y-6">
                {/* Horizontal Figure Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex space-x-1 overflow-x-auto pb-0">
                    {figuresData.map((figure: any, index: number) => (
                    <button
                      key={figure.id}
                        onClick={() => handleFigureIndexSelect(index)}
                        className={`px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 whitespace-nowrap min-w-0 flex items-center gap-2 cursor-pointer ${
                        selectedFigureIndex === index
                            ? 'text-blue-600 border-blue-500 bg-blue-50'
                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">Figure {index + 1}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {figure.panels?.length || 0}p
                          </span>
                          {figure.qcChecks && figure.qcChecks.length > 0 && (
                            <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">
                              {figure.qcChecks.length}c
                            </span>
                          )}
                        </div>
                    </button>
                  ))}
                  </div>
                </div>

                {/* Selected Figure Content - Organized Sections */}
                {selectedFigure && (
                  <div className="space-y-8">
                    {/* Figure Header with Actions */}
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{selectedFigure.title || selectedFigure.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">Figure {selectedFigureIndex + 1} of {figuresData.length}</p>
                        </div>
                        <div className="flex items-center gap-3">
                        <Button
                            size="default"
                          variant="outline"
                          onClick={() => setShowExpandedFigure(showExpandedFigure === selectedFigure.id ? null : selectedFigure.id)}
                            className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <ZoomIn className="w-4 h-4" />
                          {showExpandedFigure === selectedFigure.id ? "Collapse" : "Expand"}
                        </Button>
                        <Button
                            size="default"
                            variant="outline"
                            onClick={() => handleEditFigure(selectedFigureIndex)}
                            className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Figure
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                          onClick={() => handleDeleteFigure(selectedFigureIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                      </div>
                    </div>

                      {/* Figure Statistics */}
                      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedFigure.panels?.length || 0}</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">Panels</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{(selectedFigure.qcChecks || []).length}</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">QC Checks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{(selectedFigure.linkedData || []).length}</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">Linked Data</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${imageLoadStatus[String(selectedFigure.id)] === 'api' ? 'text-green-600' : 'text-amber-600'}`}>
                            {imageLoadStatus[String(selectedFigure.id)] === 'api' ? 'API' : 'Mock'}
                          </div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">Image Source</div>
                        </div>
                      </div>
                    </div>

                    {/* Figure Image Section */}
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Figure Image</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleOverlays(selectedFigure.id)}
                            className="hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <LucideEye className="w-4 h-4 mr-1" />
                            {overlayVisibility[selectedFigure.id] ? 'Hide' : 'Show'} Overlays
                          </Button>
                        </div>
                      </div>
                      
                        <div className="relative">
                          <img
                          src={getImageUrl(msid, selectedFigure.id, { type: 'full' }, useApiData)}
                            alt={selectedFigure.title}
                            className={`w-full object-contain border rounded-lg ${
                            showExpandedFigure === selectedFigure.id ? "max-h-[600px]" : "max-h-[400px]"
                            }`}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              const isFromAPI = target.src.includes('/api/v1/manuscripts/') && !target.src.includes('/public/');
                              const figureId = String(selectedFigure.id);
                            const newStatus = isFromAPI ? 'api' : 'fallback';
                            
                            // Only update if status has changed to prevent endless loops
                            setImageLoadStatus(prev => {
                              if (prev[figureId] === newStatus) {
                                return prev; // No change, prevent re-render
                              }
                              return {
                                ...prev,
                                [figureId]: newStatus
                              };
                            });
                              
                            // Only log once per image load
                            if (!target.hasAttribute('data-loaded')) {
                              console.log(`🖼️ Figure ${selectedFigure.id} image loaded successfully:`, {
                                source: isFromAPI ? 'API Data4Rev' : 'Fallback Mock',
                                url: target.src,
                                naturalWidth: target.naturalWidth,
                                naturalHeight: target.naturalHeight,
                                currentSrc: target.currentSrc
                              });
                              
                              // Mark as loaded to prevent duplicate logs
                              target.setAttribute('data-loaded', 'true');
                              target.setAttribute('data-source', isFromAPI ? 'api' : 'fallback');
                            }
                            }}
                            onError={async (e) => {
                              const target = e.target as HTMLImageElement;
                              const figureId = String(selectedFigure.id);
                              const imageKey = `${figureId}-full`;
                              
                              if (!target.src.includes('placeholder') && !target.src.includes('/public/') && useApiData) {
                                // Check if this image is already marked as permanently failed
                                if (permanentlyFailedImages.has(imageKey)) {
                                  console.log(`⚠️ Skipping retry for permanently failed image: ${imageKey}`);
                                  return;
                                }
                                
                                // Mark as permanently failed (likely unsupported format like EPS)
                                console.warn(`🚫 Marking image as permanently failed: ${imageKey} (likely unsupported format)`);
                                setPermanentlyFailedImages(prev => new Set(prev).add(imageKey));
                                console.warn(`❌ API image failed to load: ${target.src}, falling back to placeholder`);
                                
                                // Update status to fallback when API image fails
                                setImageLoadStatus(prev => ({
                                  ...prev,
                                  [figureId]: 'fallback'
                                }));
                                
                                target.src = getImageUrl(msid, selectedFigure.id, { type: 'full' }, false);
                                target.setAttribute('data-source', 'placeholder-fallback');
                              }
                            }}
                          />
                          
                          {/* Image Source Indicator */}
                        <div className="absolute top-3 right-3">
                            {(() => {
                              const figureId = String(selectedFigure.id);
                              const actualLoadStatus = imageLoadStatus[figureId];
                              
                              if (actualLoadStatus === 'api') {
                                return (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300 shadow-sm">
                                    🖼️ API Image
                                  </Badge>
                                );
                              } else if (actualLoadStatus === 'fallback' || !useApiData) {
                                return (
                                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300 shadow-sm">
                                    📝 Fallback Mock
                                  </Badge>
                                );
                              } else {
                                return (
                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300 shadow-sm">
                                    ⏳ Loading...
                                  </Badge>
                                );
                              }
                            })()}
                        </div>
                        
                        {/* Panel Overlays */}
                        {overlayVisibility[selectedFigure.id] && (selectedFigure.panels || []).map((panel: any, panelIndex: number) => (
                            <div
                              key={panel.id}
                            className="absolute border-2 border-blue-500 bg-blue-500/10 rounded cursor-pointer hover:bg-blue-500/20 transition-colors"
                              style={{
                              left: `${5 + (panelIndex % 3) * 30}%`,
                              top: `${5 + Math.floor(panelIndex / 3) * 25}%`,
                              width: "25%",
                              height: "20%",
                            }}
                            onClick={() => handlePanelClick(panel.id)}
                          >
                            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                              Panel {panel.id || panel.label}
                              </div>
                            </div>
                        ))}
                      </div>
                      </div>

                    {/* Figure Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Figure Caption Section */}
                      <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Figure Caption</h4>
                          <Button size="sm" variant="outline" className="hover:bg-gray-100 cursor-pointer transition-colors">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Caption
                          </Button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <p className="text-sm leading-relaxed text-gray-700">
                            {selectedFigure.legend || "No caption available for this figure."}
                          </p>
                          </div>
                        </div>

                      {/* Panels Management Section */}
                      <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            Panels ({selectedFigure.panels?.length || 0})
                          </h4>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                console.log('Add panel clicked for figure:', selectedFigure.id);
                              }}
                              className="hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Panel
                            </Button>
                          </div>
                        </div>
                        
                        {selectedFigure.panels && selectedFigure.panels.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                              {selectedFigure.panels.map((panel: any, panelIndex: number) => {
                                const panelChecks = (selectedFigure.qcChecks as any)?.filter((check: any) => 
                                check.panelId === panel.id || check.panelId === panel.label
                                ) || []
                                
                                return (
                                <div 
                                  key={panel.id} 
                                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handlePanelClick(panel.id)}
                                        onMouseEnter={() => setHoveredPanel(panel.id)}
                                        onMouseLeave={() => setHoveredPanel(null)}
                                      >
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg border flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-blue-700">{panel.id || panel.label}</span>
                                        </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {panel.description || `Panel ${panel.id || panel.label}`}
                                    </div>
                                        {panelChecks.length > 0 && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {panelChecks.length} checks
                                        </Badge>
                                        {panelChecks.some((c: any) => c.type === 'error') && (
                                          <Badge variant="destructive" className="text-xs">Issues</Badge>
                                        )}
                                            </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPanel(selectedFigureIndex, panelIndex);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No panels added yet</p>
                            <p className="text-xs mt-1">Click "Add Panel" to create the first panel</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                    {/* Additional Sections Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Figure QC Checks Section */}
                      {(selectedFigure.qcChecks && selectedFigure.qcChecks.length > 0) && (
                        <div className="bg-white border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                              QC Checks ({selectedFigure.qcChecks.length})
                            </h4>
                                        </div>
                          
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedFigure.qcChecks.map((check: any, checkIndex: number) => (
                              <div key={checkIndex} className={`p-3 rounded-lg border ${
                                check.type === 'error' ? 'bg-red-50 border-red-200' :
                                check.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-blue-50 border-blue-200'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {getQCIcon(check.type)}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{check.message}</p>
                                    <p className="text-xs text-gray-600 mt-1">{check.details}</p>
                                    {check.panelId && (
                                      <p className="text-xs text-blue-600 mt-1">Panel: {check.panelId}</p>
                                    )}
                                  </div>
                                  {check.aiGenerated && (
                                    <div className="flex gap-1">
                                      {getQCActions(check, `figure-${selectedFigure.id}`, checkIndex)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Figure Linked Data Section */}
                      <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Link className="w-5 h-5 text-blue-500" />
                            Linked Data ({(selectedFigure.linkedData || []).length})
                          </h4>
                          <Button size="sm" variant="outline" className="hover:bg-gray-100 cursor-pointer transition-colors">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Data Link
                          </Button>
                                      </div>
                        
                        {selectedFigure.linkedData && selectedFigure.linkedData.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedFigure.linkedData.map((data: any, dataIndex: number) => (
                              <div key={dataIndex} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">{data.type}</Badge>
                                      <span className="text-sm font-medium text-gray-900 truncate">{data.identifier}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{data.description}</p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Button size="sm" variant="ghost" asChild>
                                      <a href={data.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                            </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No linked data yet</p>
                            <p className="text-xs mt-1">Add repository links and data sources</p>
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

            {/* AI Checks Section - Moved to Bottom */}
            {visibleAiChecks.length > 0 && (
              <div className="space-y-3 mt-8 pt-8 border-t">
                <h4 className="font-semibold text-gray-900">
                  All AI Checks ({visibleAiChecks.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {visibleAiChecks.map((check, index) => {
                    const isIgnored = ignoredChecks.has(check.checkId);
                    const isApproved = approvedChecks.has(check.checkId);
                      
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
                              {renderCheckActions({...check, checkId: check.checkId}, "ai-quality", index)}
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
            )}
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
            {(manuscript.qcChecks || []).filter((check: { aiGenerated: any }) => check.aiGenerated).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  AI Checks
                </Label>
                {(manuscript.qcChecks || [])
                  .filter((check: any) => check.aiGenerated)
                  .map((check: any, checkIndex: number) => {
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
            {(manuscript.qcChecks || []).filter((check: { aiGenerated: any }) => !check.aiGenerated).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  QC Checks
                </Label>
                {(manuscript.qcChecks || [])
                  .filter((check: { aiGenerated: any }) => !check.aiGenerated)
                  .map((check: any, checkIndex: number) => (
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

          {/* Quick Figures Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-6 h-6" />
            All Figures Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(figuresData || []).map((figure: any, figureIndex: number) => (
            <div 
              key={figure.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleFigureSelect(figureIndex)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">Figure {figureIndex + 1}</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFigure(figureIndex);
                      }}
                      title="Edit figure"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFigure(figureIndex);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete figure"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Figure Thumbnail */}
                <div className="relative">
                  <div className="relative">
                    <img
                      src={getImageUrl(msid, figure.id, { type: 'thumbnail' }, useApiData)}
                      alt={figure.title || figure.label}
                      className="w-full h-32 object-cover border rounded"
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Prevent duplicate logging for thumbnails
                        if (!target.hasAttribute('data-thumb-loaded')) {
                          target.setAttribute('data-thumb-loaded', 'true');
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('placeholder') && !target.hasAttribute('data-thumb-fallback')) {
                          target.src = getImageUrl(msid, figure.id, { type: 'thumbnail' }, false);
                          target.setAttribute('data-thumb-fallback', 'true');
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm truncate">{figure.title || figure.label}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{figure.panels?.length || 0} panels</span>
                    <span>{(figure.qcChecks || []).length} checks</span>
                  </div>
                  {figure.qcChecks && figure.qcChecks.length > 0 && (
                    <div className="flex gap-1">
                      {figure.qcChecks.some((c: any) => c.type === 'error') && (
                        <Badge variant="destructive" className="text-xs">Issues</Badge>
                      )}
                      {figure.qcChecks.some((c: any) => c.type === 'warning') && (
                        <Badge variant="outline" className="text-xs">Warnings</Badge>
                      )}
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  ))}
                  </div>
        </CardContent>
      </Card>

      </div>
    )
  })

  const ListReviewView = () => {
    // Use pre-computed checks from top level to avoid duplicate calculations
    const allQCChecksWithLocation = allQCChecks.map((check: any) => ({
      ...check,
      location: check.figureId ? `Figure ${check.figureId}` : "General Manuscript"
    }))

    const validationIssuesWithLocation = validationIssues.map((check: any) => ({
      ...check,
      location: check.figureId ? `Figure ${check.figureId}` : "General Manuscript"
    }))
    
    const aiChecksWithLocation = aiChecks.map((check: any) => ({
      ...check,
      location: check.figureId ? `Figure ${check.figureId}` : "General Manuscript"
    }))

    // Categorize source data files
    const categorizeFiles = (files: any[]) => {
      if (!files || files.length === 0) return {
        manuscript: [],
        figures: [],
        supplementary: [],
        metadata: [],
        other: []
      }

      return {
        manuscript: files.filter((file: any) => {
          const filename = file.filename?.toLowerCase() || file.name?.toLowerCase() || ''
          const uri = file.uri?.toLowerCase() || ''
          return filename.includes('.pdf') || 
                 uri.includes('/pdf/') || 
                 (filename.includes('.docx') && uri.includes('/doc/'))
        }),
        figures: files.filter((file: any) => {
          const filename = file.filename?.toLowerCase() || file.name?.toLowerCase() || ''
          const uri = file.uri?.toLowerCase() || ''
          return (filename.includes('.png') || filename.includes('.jpg') || 
                 filename.includes('.jpeg') || filename.includes('.tiff') || 
                 filename.includes('.gif') || filename.includes('.svg') ||
                 filename.includes('.pdf') || filename.includes('.eps')) && 
                 (uri.includes('/graphic/') || uri.includes('/figure') || filename.includes('fig'))
        }),
        supplementary: files.filter((file: any) => {
          const filename = file.filename?.toLowerCase() || file.name?.toLowerCase() || ''
          const uri = file.uri?.toLowerCase() || ''
          return uri.includes('/suppl_data/') || 
                 filename.includes('supplement') ||
                 filename.includes('.xlsx') ||
                 filename.includes('.csv') ||
                 filename.includes('data') ||
                 filename.includes('.zip')
        }),
        metadata: files.filter((file: any) => {
          const filename = file.filename?.toLowerCase() || file.name?.toLowerCase() || ''
          return filename.includes('.xml') || filename.includes('.json')
        }),
        other: files.filter((file: any) => {
          const filename = file.filename?.toLowerCase() || file.name?.toLowerCase() || ''
          const uri = file.uri?.toLowerCase() || ''
          // Files that don't fit into other categories
          return !filename.includes('.pdf') && 
                 !uri.includes('/pdf/') && 
                 !uri.includes('/graphic/') && 
                 !uri.includes('/figure') && 
                 !uri.includes('/suppl_data/') && 
                 !filename.includes('supplement') &&
                 !filename.includes('.xml') && 
                 !filename.includes('.json') &&
                 !filename.includes('fig') &&
                 !(filename.includes('.docx') && uri.includes('/doc/'))
        })
      }
    }

    const categorizedFiles = categorizeFiles(sourceDataFiles)

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
                  {(manuscript.figures || []).reduce((acc: any, fig: any) => acc + (fig.panels?.length || 0), 0)}
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

        {/* Source Files Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Source Data Files
                {isLoadingSourceData && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                )}
              </CardTitle>
              {!isLoadingSourceData && !sourceDataError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSourceDataFiles}
                  title="Refresh source data"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
            {sourceDataFiles.length > 0 && (
              <CardDescription>
                {sourceDataFiles.length} files available for download
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {sourceDataError ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800">Error loading source data: {sourceDataError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSourceDataFiles}
                  className="ml-auto"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            ) : isLoadingSourceData ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading source data files...</p>
                </div>
              </div>
            ) : sourceDataFiles.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No source data files available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Manuscript Files */}
                {categorizedFiles.manuscript.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Manuscript Files ({categorizedFiles.manuscript.length})
                    </h4>
                    <div className="grid gap-2">
                      {categorizedFiles.manuscript.map((file: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="font-medium">{file.filename || file.name}</p>
                              {file.uri && (
                                <p className="text-xs text-gray-500">{file.uri}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/v1/manuscripts/${msid}/files/${file.id}/download`, '_blank')}
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Figure Files */}
                {categorizedFiles.figures.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Figure Files ({categorizedFiles.figures.length})
                    </h4>
                    <div className="grid gap-2">
                      {categorizedFiles.figures.map((file: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{file.filename || file.name}</p>
                              {file.uri && (
                                <p className="text-xs text-gray-500">{file.uri}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/v1/manuscripts/${msid}/files/${file.id}/download`, '_blank')}
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supplementary Files */}
                {categorizedFiles.supplementary.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Supplementary Data ({categorizedFiles.supplementary.length})
                    </h4>
                    <div className="grid gap-2">
                      {categorizedFiles.supplementary.map((file: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">{file.filename || file.name}</p>
                              {file.uri && (
                                <p className="text-xs text-gray-500">{file.uri}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/v1/manuscripts/${msid}/files/${file.id}/download`, '_blank')}
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Files */}
                {categorizedFiles.metadata.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Metadata Files ({categorizedFiles.metadata.length})
                    </h4>
                    <div className="grid gap-2">
                      {categorizedFiles.metadata.map((file: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">{file.filename || file.name}</p>
                              {file.uri && (
                                <p className="text-xs text-gray-500">{file.uri}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/v1/manuscripts/${msid}/files/${file.id}/download`, '_blank')}
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Files */}
                {categorizedFiles.other.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Other Files ({categorizedFiles.other.length})
                    </h4>
                    <div className="grid gap-2">
                      {categorizedFiles.other.map((file: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{file.filename || file.name}</p>
                              {file.uri && (
                                <p className="text-xs text-gray-500">{file.uri}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/v1/manuscripts/${msid}/files/${file.id}/download`, '_blank')}
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download All Button */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Total: {sourceDataFiles.length} files
                    </p>
                    <Button
                      onClick={() => window.open(`/api/v1/manuscripts/${msid}/download`, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Files
                    </Button>
                  </div>
                </div>
              </div>
            )}
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

  // Show loading screen if detail data hasn't loaded yet
  if (!isDetailLoadComplete || (useApiData && isLoadingApi && !manuscript.fallback)) {
    return <ManuscriptLoadingScreen useApiData={useApiData} onBack={onBack} />
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
            {(manuscript.priority === 'urgent' || manuscript.priority === 'high') && (
              <div className="flex items-center gap-2">
                {/* Priority Badges */}
                {manuscript.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs">
                    URGENT
                  </Badge>
                )}
                {manuscript.priority === 'high' && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    HIGH
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manuscript Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Authors
              </h4>
              <div>
                <AuthorList authors={manuscript.authors} />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                DOI
              </h4>
              <div>
                <a
                  href={`https://doi.org/${manuscript.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block"
                >
                  {manuscript.doi}
                </a>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Received
                </h4>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </h4>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900">{manuscript.received}</p>
                <Badge variant={manuscript.badgeVariant || "outline"} className="text-xs">
                  {manuscript.displayStatus || manuscript.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Assigned To
              </h4>
              <div>
                <div className="flex items-center gap-2">
                  {manuscript.assignedTo && manuscript.assignedTo !== "" ? (
                    <>
                      {session?.user && (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Assigned to you" />
                      )}
                      <span className="text-sm text-gray-900 font-medium">{manuscript.assignedTo}</span>
                      {session?.user && (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          You
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Journal
              </h4>
              <div>
                <p className="text-sm text-gray-900">{manuscript.journal || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Accession
              </h4>
              <div>
                <p className="text-sm text-gray-900 font-mono">{manuscript.accessionNumber || 'Not assigned'}</p>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Modified By
              </h4>
              <div>
                <p className="text-sm text-gray-900">{manuscript.modifiedBy}</p>
              </div>
            </div>
          </div>
          
          {/* API Validation Errors */}
          {manuscript.errors && (
            <div className="border rounded-lg p-4 bg-red-50 border-red-200">
              <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                API Validation Errors
              </h4>
              <p className="text-sm text-red-800">{manuscript.errors}</p>
            </div>
          )}

          {/* Assignment Accordion Panel */}
          <div className="border rounded-lg bg-gray-50">
            {/* Accordion Header - Always Visible */}
            <button
              onClick={() => setAssignmentAccordionOpen(!assignmentAccordionOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700">Assignment & Actions</h3>
                </div>
                
                {/* Compact Assignment Status */}
                <div className="flex items-center gap-2 ml-2">
                  {manuscript.assignedTo && manuscript.assignedTo !== "" ? (
                    <div className="flex items-center gap-2">
                      {session?.user && (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Assigned to you" />
                      )}
                      <span className="text-xs font-medium text-gray-700">{manuscript.assignedTo}</span>
                      {session?.user && (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          You
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Unassigned</span>
                  )}
                  
                  {/* Status Indicators */}
                  <div className="flex items-center gap-1">
              {session?.user && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Logged in" />
                    )}
                    {manuscript.workflowState === 'deposited-to-biostudies' && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Deposited
                      </Badge>
                    )}
                </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {assignmentAccordionOpen ? 'Less' : 'More'}
                </span>
                {assignmentAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            </button>

            {/* Accordion Content - Expandable */}
            {assignmentAccordionOpen && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                  {/* Left Column - Assignment Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Current Assignee</label>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    {manuscript.assignedTo && manuscript.assignedTo !== "" ? (
                      <>
                        {session?.user && (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" title="Assigned to you" />
                        )}
                        <span className="text-sm font-medium text-gray-900 flex-1">{manuscript.assignedTo}</span>
                        {session?.user && (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                            You
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>
                
                {manuscript.lastModified && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Last Change</label>
                    <div className="p-2 bg-white rounded border">
                      <span className="text-xs text-gray-500">
                        {new Date(manuscript.lastModified).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                    {session?.user && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Current User</label>
                        <div className="p-2 bg-white rounded border">
                          <span className="text-xs text-gray-700">
                            {session.user.name || session.user.email}
                          </span>
                        </div>
                      </div>
                    )}
              </div>
              
              {/* Right Column - Actions */}
              <div className="space-y-3">
                <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Assignment Actions</label>
                  <div className="space-y-2">
                    {session?.user ? (
                      <>
                        {manuscript.assignedTo && 
                         manuscript.assignedTo !== "" && 
                         (session.user.name === manuscript.assignedTo || session.user.email === manuscript.assignedTo) ? (
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => {
                              setManuscript((prev: any) => ({
                                ...prev,
                                assignedTo: "",
                                lastModified: new Date().toISOString()
                              }))
                              setTimeout(() => {
                                alert(`Manuscript unassigned from you.`)
                              }, 100)
                            }}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <UserMinus className="w-4 h-4" />
                            Unassign from me
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => {
                              const userName = session.user.name || session.user.email || 'Unknown User'
                              setManuscript((prev: any) => ({
                                ...prev,
                                assignedTo: userName,
                                lastModified: new Date().toISOString()
                              }))
                              setTimeout(() => {
                                alert(`Manuscript assigned to you.`)
                              }, 100)
                            }}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Assign to me
                          </Button>
                        )}
                        <p className="text-xs text-gray-400 text-center">
                          Changes reflected immediately
                        </p>
                          </>
                        ) : (
                          <div className="p-2 bg-white rounded border text-center">
                            <span className="text-xs text-gray-400">Login required for assignment</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Deposit to BioStudies Section */}
                    <div className="border-t pt-3">
                      <label className="text-xs font-medium text-gray-600 block mb-2">Workflow Actions</label>
                      {session?.user ? (
                        <>
                          <Button
                            variant={manuscript.workflowState === 'deposited-to-biostudies' ? "outline" : "default"}
                            size="default"
                            onClick={handleDepositToBioStudies}
                            disabled={isDepositing || manuscript.workflowState === 'deposited-to-biostudies'}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            {isDepositing ? (
                              "Depositing..."
                            ) : manuscript.workflowState === 'deposited-to-biostudies' ? (
                              "Already Deposited"
                            ) : (
                              "Deposit to BioStudies"
                            )}
                          </Button>
                          {depositError && (
                            <p className="text-xs text-red-600 text-center mt-1">
                              {depositError}
                            </p>
                          )}
                      </>
                    ) : (
                      <div className="p-2 bg-white rounded border text-center">
                          <span className="text-xs text-gray-400">Login required for workflow actions</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Notes Accordion Panel */}
          <div className="border rounded-lg bg-gray-50">
            {/* Accordion Header - Always Visible */}
            <button
              onClick={() => setNotesAccordionOpen(!notesAccordionOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700">Notes & Comments</h3>
                </div>
                
                {/* Compact Notes Status */}
                <div className="flex items-center gap-2 ml-2">
                  {notes && notes.trim() ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Has notes" />
                      <span className="text-xs text-gray-600 max-w-32 truncate">{notes}</span>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {notes.length > 50 ? `${notes.substring(0, 50)}...` : notes.length} chars
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No notes added</span>
                  )}
                  
                  {lastSaved && (
                    <span className="text-xs text-gray-400">
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {notesAccordionOpen ? 'Less' : 'More'}
                </span>
                {notesAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </button>

            {/* Accordion Content - Expandable */}
            {notesAccordionOpen && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="pt-4">
                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 block">Manuscript Notes</label>
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add notes about this manuscript, review comments, or any relevant information..."
                          className="min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingNotes(false)
                            setNotesValue(notes || "")
                          }}
                          className="hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveNotes}
                          className="hover:bg-blue-600 cursor-pointer transition-colors"
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600">Current Notes</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNotesValue(notes || "")
                            setIsEditingNotes(true)
                          }}
                          className="hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {notes ? "Edit Notes" : "Add Notes"}
                        </Button>
                      </div>
                      
                      {notes && notes.trim() ? (
                        <div className="p-3 bg-white rounded-lg border">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">{notes}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notes added yet</p>
                          <p className="text-xs mt-1">Click "Add Notes" to add comments or observations</p>
                        </div>
                      )}
                      
                      {lastSaved && (
                        <p className="text-xs text-gray-500">
                          Last saved: {lastSaved.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Review Tabs - Enhanced Visibility */}
          <div className="border-t bg-white">
            <Tabs 
              value={selectedView} 
              onValueChange={(value) => setSelectedView(value as "manuscript" | "list" | "fulltext")} 
              className="w-full"
            >
              <TabsList className="h-12 p-1 bg-gray-100 rounded-none border-b w-full justify-start">
                <TabsTrigger 
                  value="manuscript" 
                  className="flex-1 h-10 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-blue-500 data-[state=active]:text-blue-700"
                >
                  📊 Manuscript Review
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="flex-1 h-10 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  📋 List Review
                </TabsTrigger>
                <TabsTrigger 
                  value="fulltext" 
                  disabled={!useApiData}
                  title={!useApiData ? "Full text viewing is only available when using API data" : "View the complete manuscript text"}
                  className="flex-1 h-10 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  📄 Full Text
                </TabsTrigger>
              </TabsList>
              <TabsContent value="manuscript">
                <ManuscriptReviewView />
              </TabsContent>
              <TabsContent value="list">
                <ListReviewView />
              </TabsContent>
              <TabsContent value="fulltext">
                <FullTextView
                  useApiData={useApiData}
                  isLoadingFullText={isLoadingFullText}
                  fullTextError={fullTextError}
                  fullTextContent={fullTextContent}
                  fullTextMetadata={fullTextMetadata}
                  fetchFullTextContent={fetchFullTextContent}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Panel Popup Modal */}
      {showPanelPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Panel {showPanelPopup.panelId} Analysis</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanelPopup(null)}
                >
                  <X className="w-4 h-4" />
                  </Button>
                </div>
              
              {/* Main content */}
              <div className="flex-1 overflow-hidden p-6">
                {/* Top section - Image and Caption side by side */}
                <div className="flex gap-6 mb-6">
                  {/* Left side - Main image with bounding box */}
                  <div className="flex-1">
                    <div className="relative">
                      {(() => {
                        // Use the same main figure image that's displayed in the main view
                        const selectedFigure = manuscript?.figures?.[0]; // Use the currently selected figure
                        const mainImageSrc = getImageUrl(msid, selectedFigure?.id || '', { type: 'full' }, useApiData);
                        
                        return (
                          <>
                            <img
                              src={mainImageSrc}
                              alt="Figure with highlighted panel"
                              className="w-full h-auto max-h-[400px] object-contain border rounded"
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Prevent duplicate logging for popup modal images
                                if (!target.hasAttribute('data-popup-loaded')) {
                                  target.setAttribute('data-popup-loaded', 'true');
                                }
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('placeholder') && !target.hasAttribute('data-popup-fallback')) {
                                  // Try fallback image for popup
                                  target.src = getImageUrl(msid, selectedFigure?.id || '', { type: 'full' }, false);
                                  target.setAttribute('data-popup-fallback', 'true');
                                }
                              }}
                            />
                            {/* Bounding box overlay - outline only */}
                            <div className="absolute border-2 border-red-500 rounded pointer-events-none"
                                 style={{
                                   left: '15%',
                                   top: '25%',
                                   width: '35%',
                                   height: '45%'
                                 }}>
                              <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                Panel {showPanelPopup.panelId}
          </div>
            </div>
                          </>
                        );
                      })()}
            </div>
          </div>
                  
                  {/* Right side - Panel Caption */}
                  <div className="w-96">
                    <div className="bg-gray-50 p-4 rounded-lg h-full">
                      <h3 className="font-medium text-gray-900 mb-3">Panel {showPanelPopup.panelId} Caption</h3>
                      <div className="text-sm text-gray-700 max-h-[350px] overflow-y-auto">
                        {(() => {
                          // Find the specific panel that was clicked
                          const selectedFigure = manuscript?.figures?.[0];
                          const panel = selectedFigure?.panels?.find((p: any) => p.id === showPanelPopup.panelId);
                          
                          
                          // Check for caption in multiple possible properties
                          // Note: Real data from local files stores captions in 'legend' property
                          if (panel?.legend) {
                            return panel.legend;
                          }
                          if (panel?.caption) {
                            return panel.caption;
                          }
                          if (panel?.description) {
                            return panel.description;
                          }
                          
                          // Fallback to main figure caption if panel caption not found
                          return selectedFigure?.caption || "No caption available for this panel.";
                        })()}
              </div>
                </div>
                </div>
                </div>
                
                {/* Bottom section - AI and QC checks */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">AI and QC Checks</h3>
                  <div className="max-h-64 overflow-y-auto">
                
                {/* Use pre-computed AI/QC checks to avoid duplicate calculations */}
                <div className="space-y-4">
                  {/* AI Checks - Use top-level computation */}
                {(() => {
                    const panelAiChecks = aiChecks;
                    
                    return panelAiChecks.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                            <Cpu className="w-4 h-4" />
                          AI Checks ({panelAiChecks.length})
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                          {panelAiChecks.map((check: any, index: number) => {
                              const checkId = getCheckId(check, "ai-quality", index);
                              const isIgnored = ignoredChecks.has(checkId);
                              const isApproved = approvedChecks.has(checkId);
                              
                              if (isIgnored && !showIgnoredChecks) return null;
                              
                              return (
                                <div key={index} className={`p-3 rounded-lg border ${
                                  isApproved ? 'bg-green-50 border-green-200' :
                                  isIgnored ? 'bg-gray-50 border-gray-200 opacity-60' :
                                  'bg-blue-50 border-blue-200'
                                }`}>
                                  <div className="flex items-start gap-2">
                                    {getQCIcon(check.type)}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{check.message}</p>
                                      <p className="text-xs text-gray-600 mt-1">{check.details}</p>
                                      {check.confidence && (
                                        <p className="text-xs text-blue-600 mt-1">
                                          Confidence: {Math.round(check.confidence * 100)}%
                                        </p>
            )}
          </div>
            </div>
            </div>
                              );
                            })}
            </div>
              </div>
                    );
                  })()}

                  {/* QC Checks - Use top-level computation */}
                  {(() => {
                    const panelQcChecks = validationIssues;
                    
                    return panelQcChecks.length > 0 && (
                        <div>
                          <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                          QC Checks ({panelQcChecks.length})
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                          {panelQcChecks.map((check: any, index: number) => (
                              <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded">
                                <div className="flex items-start gap-2">
                                  {getQCIcon(check.type)}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{check.message}</p>
                                    <p className="text-xs text-gray-600 mt-1">{check.details}</p>
              </div>
                                </div>
                              </div>
                            ))}
                </div>
                </div>
                    );
                  })()}
                  
                  {(() => {
                    const panelAllChecks = [
                      ...(Array.isArray(manuscript?.qcChecks) ? manuscript.qcChecks : []),
                      ...(manuscript?.figures || []).flatMap((fig: any) => fig.qcChecks || [])
                    ];
                    const panelAiChecks = panelAllChecks.filter(check => check.aiGenerated);
                    const panelQcChecks = panelAllChecks.filter(check => !check.aiGenerated);
                    
                    return panelAiChecks.length === 0 && panelQcChecks.length === 0;
                  })() && (
                        <div className="text-center text-gray-500 py-8">
                          <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No checks available</p>
                </div>
            )}
          </div>
          </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export the component
export default ManuscriptDetail
export { ManuscriptDetail }
