import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { config } from '@/lib/config';

// GET all figures for a manuscript
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
    
    // Call Data4Rev API for figures - this is included in the manuscript details endpoint
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}`,
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
      console.error(`Data4Rev figures API error: ${data4revResponse.status}`);
      return NextResponse.json({ figures: [], fallback: true }, { status: 200 });
    }

    const manuscriptData = await data4revResponse.json();
    
    return NextResponse.json({
      figures: manuscriptData.figures || [],
      fallback: false,
      source: 'data4rev-api'
    });

  } catch (error) {
    console.error('Figures API error:', error);
    return NextResponse.json({ 
      figures: [], 
      fallback: true,
      error: 'Failed to fetch figures data'
    }, { status: 200 });
  }
}

// POST - Create new figure
export async function POST(
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
    const figureData = await request.json();
    
    // Call Data4Rev API to create figure
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${process.env.DATA4REV_API_TOKEN}`
        },
        body: JSON.stringify(figureData)
      }
    );

    if (!data4revResponse.ok) {
      console.error(`Data4Rev create figure API error: ${data4revResponse.status}`);
      
      // Mock response for fallback
      const mockFigure = {
        id: Date.now(),
        label: figureData.label || `Figure ${Date.now()}`,
        caption: figureData.caption || '',
        sort_order: figureData.sort_order || 1,
        panels: figureData.panels || [],
        links: figureData.links || [],
        source_data: figureData.source_data || [],
        check_results: [],
        fallback: true
      };
      
      return NextResponse.json(mockFigure, { status: 201 });
    }

    const createdFigure = await data4revResponse.json();
    
    return NextResponse.json({
      ...createdFigure,
      fallback: false,
      source: 'data4rev-api'
    }, { status: 201 });

  } catch (error) {
    console.error('Create figure API error:', error);
    return NextResponse.json({ 
      error: 'Failed to create figure',
      fallback: true
    }, { status: 500 });
  }
}
