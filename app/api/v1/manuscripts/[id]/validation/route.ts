import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    if (!shouldBypassAuth()) {
      const authResponse = validateApiAuth(request);
      if (authResponse) {
        return authResponse;
      }
    }

    const manuscriptId = params.id;
    
    // Call Data4Rev API for validation
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/validation`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${process.env.DATA4REV_API_TOKEN}`
        }
      }
    );

    if (!data4revResponse.ok) {
      console.error(`Data4Rev validation API error: ${data4revResponse.status}`);
      
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
