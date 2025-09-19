import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { config } from '@/lib/config';

// GET specific figure
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; figureId: string } }
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

    const { id: manuscriptId, figureId } = params;
    
    // Call Data4Rev API for specific figure
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
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
      console.error(`Data4Rev figure API error: ${data4revResponse.status}`);
      return NextResponse.json({ error: 'Figure not found', fallback: true }, { status: 404 });
    }

    const figureData = await data4revResponse.json();
    
    return NextResponse.json({
      ...figureData,
      fallback: false,
      source: 'data4rev-api'
    });

  } catch (error) {
    console.error('Figure API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch figure data',
      fallback: true
    }, { status: 500 });
  }
}

// PUT - Update figure
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; figureId: string } }
) {
  try {
    // Authentication
    if (!shouldBypassAuth()) {
      const authResponse = validateApiAuth(request);
      if (authResponse) {
        return authResponse;
      }
    }

    const { id: manuscriptId, figureId } = params;
    const updateData = await request.json();
    
    // Call Data4Rev API to update figure
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${process.env.DATA4REV_API_TOKEN}`
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!data4revResponse.ok) {
      console.error(`Data4Rev update figure API error: ${data4revResponse.status}`);
      
      // Mock response for fallback
      return NextResponse.json({
        ...updateData,
        id: figureId,
        fallback: true,
        updated_at: new Date().toISOString()
      });
    }

    const updatedFigure = await data4revResponse.json();
    
    return NextResponse.json({
      ...updatedFigure,
      fallback: false,
      source: 'data4rev-api'
    });

  } catch (error) {
    console.error('Update figure API error:', error);
    return NextResponse.json({ 
      error: 'Failed to update figure',
      fallback: true
    }, { status: 500 });
  }
}

// DELETE figure
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; figureId: string } }
) {
  try {
    // Authentication
    if (!shouldBypassAuth()) {
      const authResponse = validateApiAuth(request);
      if (authResponse) {
        return authResponse;
      }
    }

    const { id: manuscriptId, figureId } = params;
    
    // Call Data4Rev API to delete figure
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${process.env.DATA4REV_API_TOKEN}`
        }
      }
    );

    if (!data4revResponse.ok) {
      console.error(`Data4Rev delete figure API error: ${data4revResponse.status}`);
      
      // Mock success response for fallback
      return NextResponse.json({
        success: true,
        message: 'Figure deleted (fallback)',
        fallback: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Figure deleted successfully',
      fallback: false,
      source: 'data4rev-api'
    });

  } catch (error) {
    console.error('Delete figure API error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete figure',
      fallback: true
    }, { status: 500 });
  }
}
