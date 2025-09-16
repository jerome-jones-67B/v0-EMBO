import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';

// Mark this route as dynamic to avoid static rendering issues
export const dynamic = 'force-dynamic'

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

// Data4Rev API endpoint (base URL without /v1 suffix) - backend only
const DATA4REV_API_BASE = process.env.DATA4REV_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api';

export async function GET(request: NextRequest) {
  // Validate authentication (with development bypass)
  let user;
  if (shouldBypassAuth()) {
    console.log("🔧 Development mode - bypassing authentication");
    user = getDevUser();
  } else {
    user = await validateApiAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }
  }
console.log('🔍 Debug  user:', user);
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const pagesize = parseInt(searchParams.get('pagesize') || '10');
  const states = searchParams.getAll('states');
  const sort = searchParams.get('sort') || 'received_at';
  const ascending = searchParams.get('ascending') === 'true';

  try {
    // Build query parameters for Data4Rev API
  const apiParams = new URLSearchParams({
    page: page.toString(),
    pagesize: pagesize.toString(),
    sort: sort,
    ascending: ascending.toString()
  });

  // Add states filter if provided
  states.forEach(state => {
    apiParams.append('states', state);
  });

  // Call Data4Rev API
  const apiUrl = `${DATA4REV_API_BASE}/v1/manuscripts?${apiParams.toString()}`;
  console.log('Calling Data4Rev API:', apiUrl);

  // Prepare headers with authentication
  const headers: Record<string, string> = {
    
    'Accept': 'application/json'
  };

  // Add authentication if available
  const authToken = process.env.DATA4REV_AUTH_TOKEN || '';
  console.log('🔍 Debug auth token:', {
    DATA4REV_AUTH_TOKEN: process.env.DATA4REV_AUTH_TOKEN ? 'exists' : 'missing',
    tokenUsed: authToken ? authToken.substring(0, 20) + '...' : 'none'
  });
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('🔐 Adding authentication header to Data4Rev API call');
    console.log(headers)
  } else {
    console.warn('⚠️ No authentication token found - API call may fail');
  }
  
  // Try to call the Data4Rev API

  const apiResponse = await fetch(apiUrl, {
    method: 'GET',
    headers,
    // Add timeout to prevent hanging requests
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });
  
  // if (!apiResponse.ok) {
  //   // If authentication fails, fall back to mock data
  //   if (apiResponse.status === 403 || apiResponse.status === 401) {
  //     if (apiResponse.status === 401) {
  //       console.warn('🔑 Data4Rev API authentication failed (401) - likely expired token');
  //       console.log('💡 This is expected in development - using mock data instead');
  //     } else {
  //       console.warn('🔒 Data4Rev API access denied (403) - falling back to mock data');
  //     }
  //     return handleMockDataFallback(page, pagesize, states, sort, ascending);
  //   }
  //   throw new Error(`Data4Rev API responded with status: ${apiResponse.status} ${apiResponse.statusText}`);
  // }

  const apiData = await apiResponse.json();
  console.log('Data4Rev API response:', { 
    manuscriptCount: apiData.manuscripts?.length || 0, 
    total: apiData.total 
  });

  // Return the data in the expected format
  return NextResponse.json(apiData);
} catch (error) {
  console.error('Error fetching manuscripts from Data4Rev API:', error);
  
  // For network errors or API unavailability, fall back to mock data
  console.warn('🔄 API error - falling back to mock data');
  return handleMockDataFallback(page, pagesize, states, sort, ascending);
}
}

// Fallback function to handle mock data when API is unavailable
function handleMockDataFallback(page: number, pagesize: number, states: string[], sort: string, ascending: boolean) {
  console.log('📋 Using mock data fallback with', mockManuscripts.length, 'manuscripts');
  try {
    // Filter by states if provided
    let filteredManuscripts = mockManuscripts;
    if (states.length > 0) {
      filteredManuscripts = mockManuscripts.filter(m => states.includes(m.status));
      console.log(`🔍 Filtered by states [${states.join(', ')}]: ${filteredManuscripts.length} manuscripts`);
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
      total: filteredManuscripts.length,
      fallback: true // Indicate this is mock data
    };

    console.log('📦 Returning mock data:', { count: paginatedManuscripts.length, total: response.total });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in mock data fallback:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch manuscripts - both API and fallback failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validate authentication (with development bypass)
  let user;
  if (shouldBypassAuth()) {
    console.log("🔧 Development mode - bypassing authentication");
    user = getDevUser();
  } else {
    user = await validateApiAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }
  }

  try {
    const body = await request.json();
    
    // TODO: Update to call Data4Rev API for manuscript creation
    // Currently using mock implementation - replace with actual API call

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
