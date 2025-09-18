/**
 * Image utility functions for serving manuscript figures
 */

export interface ImageOptions {
  type?: 'full' | 'thumbnail' | 'panel';
  panelId?: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp';
  apiMode?: boolean;
}

/**
 * Generate image URL for a figure
 */
export function getFigureImageUrl(
  manuscriptId: string,
  figureId: string | number,
  options: ImageOptions = {}
): string {
  const queryParams = new URLSearchParams();
  
  if (options.type) queryParams.set('type', options.type);
  if (options.panelId) queryParams.set('panel', options.panelId);
  if (options.width) queryParams.set('width', options.width.toString());
  if (options.height) queryParams.set('height', options.height.toString());
  if (options.format) queryParams.set('format', options.format);
  if (options.apiMode) queryParams.set('apiMode', 'true');
  
  const baseUrl = `/api/v1/manuscripts/${manuscriptId}/figures/${figureId}/image`;
  const queryString = queryParams.toString();
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate thumbnail image URL for a figure
 */
export function getFigureThumbnailUrl(
  manuscriptId: string,
  figureId: string | number,
  size: number = 200
): string {
  return getFigureImageUrl(manuscriptId, figureId, {
    type: 'thumbnail',
    width: size,
    height: size
  });
}

/**
 * Generate panel-specific image URL
 */
export function getPanelImageUrl(
  manuscriptId: string,
  figureId: string | number,
  panelId: string,
  options: Omit<ImageOptions, 'panelId'> = {}
): string {
  return getFigureImageUrl(manuscriptId, figureId, {
    ...options,
    type: 'panel',
    panelId
  });
}

/**
 * Fallback to placeholder images for mock data
 */
function getFallbackImageUrl(
  manuscriptId: string,
  figureId: string,
  options: ImageOptions
): string {
  // For newly created or mock figures, return placeholder
  if (figureId.startsWith('figure-')) {
    return '/placeholder-e9mgd.png';
  }
  
  // Generate deterministic placeholder based on IDs
  const seed = `${manuscriptId}-${figureId}-${options.panelId || 'main'}`;
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

  // Simple hash function for deterministic selection
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
}

/**
 * Get image URL with automatic fallback handling
 */
export function getImageUrl(
  manuscriptId: string,
  figureId: string | number,
  options: ImageOptions = {},
  useApiData: boolean = false
): string {
  if (useApiData) {
    // In API mode, try to get real image URL first
    const apiUrl = getFigureImageUrl(manuscriptId, figureId, { ...options, apiMode: true });
    return apiUrl;
  } else {
    // In mock mode, use fallback images
    return getFallbackImageUrl(manuscriptId, String(figureId), options);
  }
}

/**
 * Preload image to check if it exists
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Get image with fallback chain
 */
export async function getImageWithFallback(
  manuscriptId: string,
  figureId: string | number,
  options: ImageOptions = {},
  useApiData: boolean = false
): Promise<string> {
  if (useApiData) {
    // Try API image first, fall back to placeholder if it fails
    const apiUrl = getFigureImageUrl(manuscriptId, figureId, options);
    
    try {
      const response = await fetch(apiUrl, { method: 'HEAD' });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        return apiUrl;
      }
    } catch (error) {
      console.warn(`Image fetch failed for ${figureId}, using fallback`);
    }
  }
  
  return getFallbackImageUrl(manuscriptId, String(figureId), options);
}
