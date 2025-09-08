import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing - this would normally come from Data4Rev API
const mockManuscripts = [
  {
    msid: "EMBO-2024-001",
    journal: "EMBO Journal",
    doi: "10.1038/s41586-024-00123-4",
    accession_number: "ACC-2024-001",
    title: "Molecular mechanisms of protein folding in cellular environments",
    authors: "Smith, J., Johnson, A., Williams, B.",
    id: 1,
    received_at: "2024-01-15T10:30:00Z",
    status: "in_progress",
    note: "Initial submission with preliminary data"
  },
  {
    msid: "EMBO-2024-002", 
    journal: "EMBO Reports",
    doi: "10.1038/s41586-024-00124-5",
    accession_number: "ACC-2024-002",
    title: "Regulation of gene expression during development",
    authors: "Brown, C., Davis, D., Wilson, E.",
    id: 2,
    received_at: "2024-01-20T14:15:00Z",
    status: "submitted",
    note: "Comprehensive study on developmental gene regulation"
  },
  {
    msid: "EMBO-2024-003",
    journal: "EMBO Molecular Medicine", 
    doi: "10.1038/s41586-024-00125-6",
    accession_number: "ACC-2024-003",
    title: "Therapeutic targets in cancer metabolism",
    authors: "Garcia, F., Martinez, G., Rodriguez, H.",
    id: 3,
    received_at: "2024-01-25T09:45:00Z",
    status: "needs_revision",
    note: "Requires additional experimental validation"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pagesize = parseInt(searchParams.get('pagesize') || '20');
    const states = searchParams.getAll('states');
    const sort = searchParams.get('sort') || 'received_at';
    const ascending = searchParams.get('ascending') === 'true';

    // Filter by states if provided
    let filteredManuscripts = mockManuscripts;
    if (states.length > 0) {
      filteredManuscripts = mockManuscripts.filter(m => states.includes(m.status));
    }

    // Sort manuscripts
    filteredManuscripts.sort((a, b) => {
      let aVal = a[sort as keyof typeof a];
      let bVal = b[sort as keyof typeof b];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });

    // Paginate
    const startIndex = page * pagesize;
    const endIndex = startIndex + pagesize;
    const paginatedManuscripts = filteredManuscripts.slice(startIndex, endIndex);

    const response = {
      manuscripts: paginatedManuscripts,
      total: filteredManuscripts.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching manuscripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manuscripts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new manuscript (mock implementation)
    const newManuscript = {
      msid: `EMBO-2024-${Date.now()}`,
      journal: body.journal || "EMBO Journal",
      doi: `10.1038/s41586-${Date.now()}`,
      accession_number: `ACC-${Date.now()}`,
      title: body.title || "Untitled Manuscript",
      authors: body.authors || "Unknown Author",
      id: Date.now(),
      received_at: new Date().toISOString(),
      status: body.status || "submitted",
      note: body.note || null
    };

    return NextResponse.json(newManuscript, { status: 201 });
  } catch (error) {
    console.error('Error creating manuscript:', error);
    return NextResponse.json(
      { error: 'Failed to create manuscript' },
      { status: 500 }
    );
  }
}
