import { NextRequest, NextResponse } from 'next/server';

// Mock detailed manuscript data
const mockManuscriptDetails = {
  1: {
    msid: "EMBO-2024-001",
    journal: "EMBO Journal",
    doi: "10.1038/s41586-024-00123-4",
    accession_number: "ACC-2024-001",
    title: "Molecular mechanisms of protein folding in cellular environments",
    authors: "Smith, J., Johnson, A., Williams, B.",
    id: 1,
    received_at: "2024-01-15T10:30:00Z",
    status: "in_progress",
    note: "Initial submission with preliminary data",
    errors: null,
    files: [
      {
        filename: "manuscript.pdf",
        content_type: "application/pdf",
        size: 2048576,
        id: 1
      },
      {
        filename: "supplementary_data.xlsx",
        content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 1024000,
        id: 2
      }
    ],
    figures: [
      {
        label: "Figure 1",
        caption: "Protein folding pathway analysis showing intermediate states",
        sort_order: 1,
        id: 1,
        panels: [
          {
            label: "A",
            caption: "Native state structure",
            x1: 100,
            y1: 100,
            x2: 300,
            y2: 300,
            confidence: 0.95,
            sort_order: 1,
            id: 1,
            links: [],
            source_data: [],
            check_results: []
          },
          {
            label: "B", 
            caption: "Unfolded state analysis",
            x1: 350,
            y1: 100,
            x2: 550,
            y2: 300,
            confidence: 0.88,
            sort_order: 2,
            id: 2,
            links: [],
            source_data: [],
            check_results: []
          }
        ],
        links: [
          {
            name: "PDB Structure",
            uri: "https://www.rcsb.org/structure/1ABC",
            identifier: "1ABC",
            database: "PDB",
            id: 1
          }
        ],
        source_data: [
          {
            file_id: 1,
            id: 1
          }
        ],
        check_results: [
          {
            check_name: "Image Quality Check",
            status: "passed",
            message: "Image resolution meets journal requirements",
            details: "Resolution: 300 DPI, Format: TIFF",
            id: 1
          }
        ]
      }
    ],
    links: [
      {
        name: "UniProt Entry",
        uri: "https://www.uniprot.org/uniprot/P12345",
        identifier: "P12345",
        database: "UniProt",
        id: 1
      }
    ],
    check_results: [
      {
        check_name: "Data Availability",
        status: "passed",
        message: "All source data files are available",
        details: "2 files uploaded successfully",
        id: 1
      }
    ],
    source_data: [
      {
        file_id: 1,
        id: 1
      },
      {
        file_id: 2,
        id: 2
      }
    ],
    deposition_events: [
      {
        repository: "BioRxiv",
        status: "submitted",
        message: "Preprint submitted successfully",
        details: "DOI: 10.1101/2024.01.15.123456",
        timestamp: "2024-01-15T12:00:00Z",
        id: 1
      }
    ]
  },
  2: {
    msid: "EMBO-2024-002",
    journal: "EMBO Reports",
    doi: "10.1038/s41586-024-00124-5",
    accession_number: "ACC-2024-002",
    title: "Regulation of gene expression during development",
    authors: "Brown, C., Davis, D., Wilson, E.",
    id: 2,
    received_at: "2024-01-20T14:15:00Z",
    status: "submitted",
    note: "Comprehensive study on developmental gene regulation",
    errors: null,
    files: [
      {
        filename: "manuscript.pdf",
        content_type: "application/pdf",
        size: 1856432,
        id: 3
      }
    ],
    figures: [
      {
        label: "Figure 1",
        caption: "Gene expression patterns during embryonic development",
        sort_order: 1,
        id: 2,
        panels: [
          {
            label: "A",
            caption: "Early stage expression",
            x1: 100,
            y1: 100,
            x2: 300,
            y2: 300,
            confidence: 0.92,
            sort_order: 1,
            id: 3,
            links: [],
            source_data: [],
            check_results: []
          }
        ],
        links: [
          {
            name: "GEO Dataset",
            uri: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456",
            identifier: "GSE123456",
            database: "GEO",
            id: 2
          }
        ],
        source_data: [
          {
            file_id: 3,
            id: 3
          }
        ],
        check_results: [
          {
            check_name: "Data Validation",
            status: "passed",
            message: "Gene expression data validated",
            details: "All samples processed successfully",
            id: 2
          }
        ]
      }
    ],
    links: [
      {
        name: "Ensembl Gene",
        uri: "https://www.ensembl.org/Gene/Summary?g=ENSG00000123456",
        identifier: "ENSG00000123456",
        database: "Ensembl",
        id: 2
      }
    ],
    check_results: [
      {
        check_name: "Data Completeness",
        status: "passed",
        message: "All required data fields present",
        details: "Gene expression data complete",
        id: 2
      }
    ],
    source_data: [
      {
        file_id: 3,
        id: 3
      }
    ],
    deposition_events: [
      {
        repository: "GEO",
        status: "submitted",
        message: "Gene expression data submitted",
        details: "Accession: GSE123456",
        timestamp: "2024-01-20T16:00:00Z",
        id: 2
      }
    ]
  },
  3: {
    msid: "EMBO-2024-003",
    journal: "EMBO Molecular Medicine",
    doi: "10.1038/s41586-024-00125-6",
    accession_number: "ACC-2024-003",
    title: "Therapeutic targets in cancer metabolism",
    authors: "Garcia, F., Martinez, G., Rodriguez, H.",
    id: 3,
    received_at: "2024-01-25T09:45:00Z",
    status: "needs_revision",
    note: "Requires additional experimental validation",
    errors: null,
    files: [
      {
        filename: "manuscript.pdf",
        content_type: "application/pdf",
        size: 2234567,
        id: 4
      },
      {
        filename: "supplementary_figures.pdf",
        content_type: "application/pdf",
        size: 1534000,
        id: 5
      }
    ],
    figures: [
      {
        label: "Figure 1",
        caption: "Metabolic pathway analysis in cancer cells",
        sort_order: 1,
        id: 3,
        panels: [
          {
            label: "A",
            caption: "Glucose metabolism",
            x1: 100,
            y1: 100,
            x2: 300,
            y2: 300,
            confidence: 0.89,
            sort_order: 1,
            id: 4,
            links: [],
            source_data: [],
            check_results: []
          },
          {
            label: "B",
            caption: "ATP production rates",
            x1: 350,
            y1: 100,
            x2: 550,
            y2: 300,
            confidence: 0.91,
            sort_order: 2,
            id: 5,
            links: [],
            source_data: [],
            check_results: []
          }
        ],
        links: [
          {
            name: "KEGG Pathway",
            uri: "https://www.genome.jp/kegg-bin/show_pathway?hsa00010",
            identifier: "hsa00010",
            database: "KEGG",
            id: 3
          }
        ],
        source_data: [
          {
            file_id: 4,
            id: 4
          },
          {
            file_id: 5,
            id: 5
          }
        ],
        check_results: [
          {
            check_name: "Image Quality",
            status: "warning",
            message: "Some images need higher resolution",
            details: "Recommend 300 DPI for publication",
            id: 3
          }
        ]
      }
    ],
    links: [
      {
        name: "Reactome Pathway",
        uri: "https://reactome.org/content/detail/R-HSA-70326",
        identifier: "R-HSA-70326",
        database: "Reactome",
        id: 3
      }
    ],
    check_results: [
      {
        check_name: "Experimental Validation",
        status: "failed",
        message: "Additional validation experiments required",
        details: "Metabolic flux analysis needs replication",
        id: 3
      }
    ],
    source_data: [
      {
        file_id: 4,
        id: 4
      },
      {
        file_id: 5,
        id: 5
      }
    ],
    deposition_events: [
      {
        repository: "MetaboLights",
        status: "in_progress",
        message: "Metabolomics data submission in progress",
        details: "MTBLS123456",
        timestamp: "2024-01-25T11:30:00Z",
        id: 3
      }
    ]
  }
};

// Data4Rev API endpoint
const DATA4REV_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const manuscriptId = params.id;
  
  try {
    // Try to fetch from Data4Rev API first
    console.log('🔍 Fetching manuscript details from Data4Rev API for ID:', manuscriptId);
    
    // Prepare headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add authentication if available
    const authToken = process.env.DATA4REV_AUTH_TOKEN || process.env.AUTH_TOKEN;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      console.log('🔐 Adding authentication header to Data4Rev API call');
    } else {
      console.warn('⚠️ No authentication token found - API call may fail');
    }

    const apiUrl = `${DATA4REV_API_BASE}/manuscripts/${manuscriptId}`;
    console.log('Calling Data4Rev API:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers,
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!apiResponse.ok) {
      // If authentication fails or manuscript not found, fall back to mock data
      if (apiResponse.status === 403) {
        console.warn('🔒 Authentication failed - falling back to mock data');
        return handleMockDataFallback(manuscriptId);
      }
      if (apiResponse.status === 404) {
        console.warn('📄 Manuscript not found in API - falling back to mock data');
        return handleMockDataFallback(manuscriptId);
      }
      throw new Error(`Data4Rev API responded with status: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();
    console.log('✅ Data4Rev API response received:', { 
      msid: apiData.msid,
      figureCount: apiData.figures?.length || 0,
      qcCheckCount: apiData.check_results?.length || 0
    });

    // Return the data in the expected format
    return NextResponse.json(apiData);
  } catch (error) {
    console.error('❌ Error fetching manuscript details from Data4Rev API:', error);
    
    // For network errors or API unavailability, fall back to mock data
    console.warn('🔄 API error - falling back to mock data');
    return handleMockDataFallback(manuscriptId);
  }
}

// Fallback function to handle mock data when API is unavailable
function handleMockDataFallback(manuscriptId: string) {
  try {
    // Try to find by numeric ID first
    const numericId = parseInt(manuscriptId);
    let manuscript = mockManuscriptDetails[numericId as keyof typeof mockManuscriptDetails];
    
    // If not found by numeric ID, try to find by MSID in mock data
    if (!manuscript) {
      // Search through mock data for matching MSID
      const mockValues = Object.values(mockManuscriptDetails);
      const foundManuscript = mockValues.find((m: any) => m.msid === manuscriptId);
      if (foundManuscript) {
        manuscript = foundManuscript;
      }
    }
    
    // If still not found, return the first available mock manuscript
    if (!manuscript) {
      console.warn('📄 Manuscript not found in mock data, returning first available');
      manuscript = Object.values(mockManuscriptDetails)[0];
    }

    console.log('📦 Returning mock manuscript data:', { 
      msid: manuscript.msid,
      figureCount: manuscript.figures?.length || 0,
      qcCheckCount: manuscript.check_results?.length || 0,
      fallback: true
    });

    return NextResponse.json({
      ...manuscript,
      fallback: true // Indicate this is mock data
    });
  } catch (error) {
    console.error('❌ Error in mock data fallback:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch manuscript details - both API and fallback failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Mock update - in real implementation, this would update the database
    const updatedManuscript = {
      ...mockManuscriptDetails[id as keyof typeof mockManuscriptDetails],
      ...body,
      id: id
    };

    return NextResponse.json(updatedManuscript);
  } catch (error) {
    console.error('Error updating manuscript:', error);
    return NextResponse.json(
      { error: 'Failed to update manuscript' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Mock deletion - in real implementation, this would delete from database
    return NextResponse.json({ message: 'Manuscript deleted successfully' });
  } catch (error) {
    console.error('Error deleting manuscript:', error);
    return NextResponse.json(
      { error: 'Failed to delete manuscript' },
      { status: 500 }
    );
  }
}
