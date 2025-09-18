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
      const authResponse = validateApiAuth(request);
      if (authResponse) {
        return authResponse;
      }
    }

    const { id: manuscriptId, figureId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'full'; // 'full', 'thumbnail', 'panel'
    const panelId = searchParams.get('panel'); // for panel-specific images

    // Try to get image from Data4Rev API
    let imageUrl;
    
    if (type === 'panel' && panelId) {
      // Panel-specific image
      imageUrl = `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}/image`;
    } else if (type === 'thumbnail') {
      // Thumbnail image
      imageUrl = `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}/thumbnail`;
    } else {
      // Full figure image
      imageUrl = `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/figures/${figureId}/image`;
    }

    console.log(`🖼️ Attempting to fetch image from: ${imageUrl}`);

    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${process.env.DATA4REV_API_TOKEN}`
      }
    });

    if (imageResponse.ok) {
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      const imageBuffer = await imageResponse.arrayBuffer();
      
      console.log(`✅ Image served from API: ${imageUrl}, type: ${contentType}, size: ${imageBuffer.byteLength}`);
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'X-Image-Source': 'data4rev-api',
          'X-Manuscript-ID': manuscriptId,
          'X-Figure-ID': figureId
        }
      });
    }

    console.warn(`❌ Data4Rev image API failed: ${imageResponse.status}, falling back to placeholder`);
    
    // Fallback to placeholder image
    return await servePlaceholderImage(manuscriptId, figureId, type, panelId);

  } catch (error) {
    console.error('Image serving error:', error);
    
    // Fallback to placeholder image
    return await servePlaceholderImage(params.id, params.figureId, 
      new URL(request.url).searchParams.get('type') || 'full',
      new URL(request.url).searchParams.get('panel')
    );
  }
}

async function servePlaceholderImage(
  manuscriptId: string, 
  figureId: string, 
  type: string, 
  panelId: string | null
): Promise<NextResponse> {
  try {
    // Define placeholder images based on type
    const placeholderMap: Record<string, string> = {
      'full': '/protein-structures.png',
      'thumbnail': '/protein-structure-control.png', 
      'panel': '/molecular-interactions.png'
    };

    // Generate deterministic placeholder based on IDs
    const seed = `${manuscriptId}-${figureId}-${panelId || 'main'}`;
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
      '/microscopy-24-hours.png'
    ];

    // Simple hash function for deterministic selection
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const selectedImage = placeholderImages[Math.abs(hash) % placeholderImages.length];
    const imageUrl = new URL(selectedImage, 'http://localhost:3000');
    
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
    
    return NextResponse.redirect(new URL('/placeholder-e9mgd.png', request.url), 302);

  } catch (error) {
    console.error('Placeholder image serving error:', error);
    
    // On error, redirect to placeholder
    console.error(`🔄 Error serving image for ${manuscriptId}/${figureId}, redirecting to placeholder`);
    
    return NextResponse.redirect(new URL('/placeholder-e9mgd.png', request.url), 302);
  }
}
