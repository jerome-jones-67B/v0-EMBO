import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication (with development bypass)
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

    const manuscriptId = params.id;
    
    // Call Data4Rev API for validation
    console.log('🔍 Fetching manuscript validation from Data4Rev API for ID:', manuscriptId);
    
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

    const apiUrl = `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/validation`;
    console.log('Calling Data4Rev API:', apiUrl);

    const data4revResponse = await fetch(apiUrl, {
      method: 'GET',
      headers,
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!data4revResponse.ok) {
      const errorText = await data4revResponse.text().catch(() => 'Unknown error');
      console.error(`Data4Rev validation API error: ${data4revResponse.status} - ${errorText}`);
      
      // Fallback to mock validation data if API fails
      const mockValidation = {
        figures: [
          {
            links: [[
              {
                check_name: "PDB Link Validation",
                status: "passed",
                message: "All PDB links are accessible",
                details: "Verified 2 PDB structure links",
                id: 1
              }
            ]],
            label: [
              {
                check_name: "Figure Label Check",
                status: "warning", 
                message: "Consider standardizing panel labels",
                details: "Mix of uppercase and lowercase panel labels detected",
                id: 2
              }
            ],
            image: [
              {
                check_name: "Image Quality Check",
                status: "passed",
                message: "Image resolution meets requirements",
                details: "Resolution: 300 DPI, Format: TIFF",
                id: 3
              }
            ]
          }
        ],
        links: [[
          {
            check_name: "External Link Validation",
            status: "passed", 
            message: "All external links are accessible",
            details: "Checked 5 external database links",
            id: 4
          }
        ]]
      };

      return NextResponse.json({
        ...mockValidation,
        fallback: true,
        source: 'mock'
      });
    }

    const validationData = await data4revResponse.json();
    
    return NextResponse.json({
      ...validationData,
      fallback: false,
      source: 'data4rev-api'
    });

  } catch (error) {
    console.error('Validation API error:', error);
    
    // Return mock data on error
    return NextResponse.json({
      figures: [],
      links: [],
      fallback: true,
      source: 'mock-error',
      error: 'Failed to fetch validation data'
    });
  }
}
