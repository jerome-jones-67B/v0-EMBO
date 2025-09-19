import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; figureId: string } }
) {
  try {
    // Authentication
    if (!shouldBypassAuth()) {
      const user = await validateApiAuth(request);
      if (!user) {
        return createUnauthorizedResponse();
      }
    }

    const { id: manuscriptId, figureId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'full';
    const panelId = searchParams.get('panel');
    const apiMode = searchParams.get('apiMode') === 'true';

    // Try to get image from Data4Rev API first
    if (apiMode) {
      try {
        const imageFromApi = await getImageFromData4Rev(manuscriptId, figureId, type);
        if (imageFromApi) {
          return imageFromApi;
        }
      } catch (error) {
        console.warn(`Failed to get image from Data4Rev API for figure ${figureId}:`, error);
      }
    }
    
    // Fallback to placeholder image
    console.log(`📋 Serving placeholder image for figure ${figureId}`);
    return await servePlaceholderImage(request, manuscriptId, figureId, type, panelId);

  } catch (error) {
    console.error(`❌ Error in image API route:`, error);
    
    // Extract params for fallback
    const { id: fallbackManuscriptId, figureId: fallbackFigureId } = params;
    const { searchParams: fallbackSearchParams } = new URL(request.url);
    const fallbackType = fallbackSearchParams.get('type') || 'full';
    const fallbackPanelId = fallbackSearchParams.get('panel');
    
    return await servePlaceholderImage(request, fallbackManuscriptId, fallbackFigureId, fallbackType, fallbackPanelId);
  }
}

// Function to get image from Data4Rev API
async function getImageFromData4Rev(
  manuscriptId: string, 
  figureId: string, 
  type: string
): Promise<NextResponse | null> {
  try {
    // Get manuscript details to find image_file_id
    const manuscriptResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.DATA4REV_AUTH_TOKEN && {
            'Authorization': `Bearer ${process.env.DATA4REV_AUTH_TOKEN}`
          })
        }
      }
    );

    if (!manuscriptResponse.ok) {
      console.warn(`Failed to get manuscript details: ${manuscriptResponse.status}`);
      return null;
    }

    const manuscriptData = await manuscriptResponse.json();
    const figure = manuscriptData.figures?.find((f: any) => f.id.toString() === figureId);
    
    if (!figure || !figure.image_file_id) {
      console.warn(`Figure ${figureId} not found or has no image_file_id`);
      return null;
    }

    // Get image using file endpoint
    const imageEndpoint = type === 'thumbnail' ? 'preview' : 'download';
    const imageResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/files/${figure.image_file_id}/${imageEndpoint}`,
      {
        method: 'GET',
        headers: {
          ...(process.env.DATA4REV_AUTH_TOKEN && {
            'Authorization': `Bearer ${process.env.DATA4REV_AUTH_TOKEN}`
          })
        }
      }
    );

    if (!imageResponse.ok) {
      console.warn(`Failed to get image file: ${imageResponse.status}`);
      return null;
    }

    const contentType = imageResponse.headers.get('content-type');
    
    // Check if it's a supported image format
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn(`Unsupported content type: ${contentType}`);
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Image-Source': 'data4rev-api',
        'X-Manuscript-ID': manuscriptId,
        'X-Figure-ID': figureId,
        'X-Image-Type': type
      }
    });

  } catch (error) {
    console.error('Error fetching image from Data4Rev API:', error);
    return null;
  }
}

// Helper function to serve placeholder images with consistent hashing
async function servePlaceholderImage(request: NextRequest, manuscriptId: string, figureId: string, type: string, panelId?: string | null) {
  try {
    // All available scientific images for consistent assignment
    const placeholderImages = [
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
    ];
    
    // Create deterministic selection based on manuscript + figure ID
    const seed = `${manuscriptId}-${figureId}-${type}${panelId ? `-${panelId}` : ''}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const selectedImage = placeholderImages[Math.abs(hash) % placeholderImages.length];
    
    // Get the current request origin for proper URL construction
    const origin = new URL(request.url).origin;
    const imageUrl = new URL(selectedImage, origin);
    
    // Fetch the placeholder image from public directory
    const placeholderResponse = await fetch(imageUrl);
    
    if (placeholderResponse.ok) {
      const imageBuffer = await placeholderResponse.arrayBuffer();
      
      console.log(`🔄 Serving placeholder image: ${selectedImage} for ${manuscriptId}/${figureId}`);
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          'X-Image-Source': 'placeholder',
          'X-Manuscript-ID': manuscriptId,
          'X-Figure-ID': figureId,
          'X-Image-Type': type
        }
      });
    }

    // Final fallback - redirect to a default placeholder
    console.warn(`🔄 All image sources failed for ${manuscriptId}/${figureId}, using default placeholder`);
    
    const fallbackOrigin = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/placeholder-e9mgd.png', fallbackOrigin), 302);

  } catch (error) {
    console.error('Placeholder image serving error:', error);
    
    // On error, redirect to placeholder
    console.error(`🔄 Error serving image for ${manuscriptId}/${figureId}, redirecting to placeholder`);
    
    const errorOrigin = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/placeholder-e9mgd.png', errorOrigin), 302);
  }
}