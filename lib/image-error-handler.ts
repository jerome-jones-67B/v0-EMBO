/**
 * Image error handling and fallback utilities
 */

import { getImageUrl } from './image-utils';

export interface ImageLoadResult {
  src: string;
  source: 'api' | 'fallback' | 'placeholder';
  error?: string;
}

export interface ImageErrorTracker {
  failedImages: Set<string>;
  retryCount: Map<string, number>;
  lastAttempt: Map<string, number>;
}

// Global error tracker
const errorTracker: ImageErrorTracker = {
  failedImages: new Set(),
  retryCount: new Map(),
  lastAttempt: new Map()
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Load image with error handling and fallback
 */
export async function loadImageWithFallback(
  manuscriptId: string,
  figureId: string | number,
  options: {
    type?: 'full' | 'thumbnail' | 'panel';
    panelId?: string;
    width?: number;
    height?: number;
  } = {},
  useApiData: boolean = false
): Promise<ImageLoadResult> {
  const imageKey = `${manuscriptId}-${figureId}-${options.type || 'full'}${options.panelId ? `-${options.panelId}` : ''}`;
  
  // Check if image has permanently failed
  if (errorTracker.failedImages.has(imageKey)) {
    const fallbackSrc = getImageUrl(manuscriptId, figureId, options, false);
    return {
      src: fallbackSrc,
      source: 'fallback',
      error: 'Image previously failed, using fallback'
    };
  }

  // Check retry limits
  const retryCount = errorTracker.retryCount.get(imageKey) || 0;
  const lastAttempt = errorTracker.lastAttempt.get(imageKey) || 0;
  const now = Date.now();

  if (retryCount >= MAX_RETRIES) {
    errorTracker.failedImages.add(imageKey);
    const fallbackSrc = getImageUrl(manuscriptId, figureId, options, false);
    return {
      src: fallbackSrc,
      source: 'fallback',
      error: 'Max retries exceeded'
    };
  }

  // Check retry delay
  if (retryCount > 0 && (now - lastAttempt) < RETRY_DELAY) {
    const fallbackSrc = getImageUrl(manuscriptId, figureId, options, false);
    return {
      src: fallbackSrc,
      source: 'fallback',
      error: 'Waiting for retry delay'
    };
  }

  try {
    if (useApiData) {
      const apiSrc = getImageUrl(manuscriptId, figureId, options, true);
      const isValid = await validateImage(apiSrc);
      
      if (isValid) {
        // Reset error count on success
        errorTracker.retryCount.delete(imageKey);
        errorTracker.lastAttempt.delete(imageKey);
        return {
          src: apiSrc,
          source: 'api'
        };
      } else {
        throw new Error('Image validation failed');
      }
    }
  } catch (error) {
    // Track failure
    errorTracker.retryCount.set(imageKey, retryCount + 1);
    errorTracker.lastAttempt.set(imageKey, now);
    
    console.warn(`Image load attempt ${retryCount + 1} failed for ${imageKey}:`, error);
  }

  // Fallback to mock image
  const fallbackSrc = getImageUrl(manuscriptId, figureId, options, false);
  return {
    src: fallbackSrc,
    source: 'fallback',
    error: useApiData ? 'API image failed, using fallback' : undefined
  };
}

/**
 * Validate if an image URL is accessible and returns a valid image
 */
async function validateImage(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get('content-type');
    return contentType ? contentType.startsWith('image/') : false;
    
  } catch (error) {
    console.warn('Image validation failed:', error);
    return false;
  }
}

/**
 * Preload an image and return a promise that resolves when loaded
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };
    
    img.onload = () => {
      cleanup();
      resolve(true);
    };
    
    img.onerror = () => {
      cleanup();
      resolve(false);
    };
    
    // Set timeout for loading
    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 10000); // 10 second timeout
    
    img.src = src;
  });
}

/**
 * Create an image element with error handling
 */
export function createImageElement(
  manuscriptId: string,
  figureId: string | number,
  options: {
    type?: 'full' | 'thumbnail' | 'panel';
    panelId?: string;
    width?: number;
    height?: number;
    className?: string;
    alt?: string;
  } = {},
  useApiData: boolean = false,
  onLoad?: (result: ImageLoadResult) => void,
  onError?: (error: string) => void
): HTMLImageElement {
  const img = new Image();
  
  if (options.className) {
    img.className = options.className;
  }
  
  if (options.alt) {
    img.alt = options.alt;
  }

  // Load image with fallback handling
  loadImageWithFallback(manuscriptId, figureId, options, useApiData)
    .then((result) => {
      img.src = result.src;
      img.setAttribute('data-source', result.source);
      
      if (result.error) {
        img.setAttribute('data-error', result.error);
      }
      
      if (onLoad) {
        onLoad(result);
      }
    })
    .catch((error) => {
      console.error('Failed to load image:', error);
      
      // Final fallback to placeholder
      img.src = '/placeholder-e9mgd.png';
      img.setAttribute('data-source', 'placeholder');
      img.setAttribute('data-error', error.message);
      
      if (onError) {
        onError(error.message);
      }
    });

  return img;
}

/**
 * Reset error tracking for a specific image or all images
 */
export function resetImageErrors(imageKey?: string): void {
  if (imageKey) {
    errorTracker.failedImages.delete(imageKey);
    errorTracker.retryCount.delete(imageKey);
    errorTracker.lastAttempt.delete(imageKey);
  } else {
    errorTracker.failedImages.clear();
    errorTracker.retryCount.clear();
    errorTracker.lastAttempt.clear();
  }
}

/**
 * Get error statistics
 */
export function getImageErrorStats(): {
  failedCount: number;
  retryingCount: number;
  totalAttempts: number;
} {
  const retryingCount = Array.from(errorTracker.retryCount.values())
    .filter(count => count > 0 && count < MAX_RETRIES).length;
  
  const totalAttempts = Array.from(errorTracker.retryCount.values())
    .reduce((sum, count) => sum + count, 0);

  return {
    failedCount: errorTracker.failedImages.size,
    retryingCount,
    totalAttempts
  };
}
