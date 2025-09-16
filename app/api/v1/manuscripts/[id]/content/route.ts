import { NextRequest, NextResponse } from 'next/server'
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth'
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth'

// Backend API route for fetching manuscript full text content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const manuscriptId = params.id
  // Data4Rev API endpoint (base URL without /v1 suffix) - backend only
  const DATA4REV_API_BASE = process.env.DATA4REV_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api'
  
  try {
    console.log(`📄 Fetching full text content for manuscript ID: ${manuscriptId}`)
    
    // Call the Data4Rev API content endpoint
    const response = await fetch(`${DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/content`, {
      headers: {
        'Authorization': `Bearer ${process.env.DATA4REV_AUTH_TOKEN || process.env.AUTH_TOKEN || ''}`,
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('⚠️ Data4Rev API authentication failed for content endpoint')
        return NextResponse.json({
          error: 'Authentication failed',
          fallback: true,
          content: 'Full text content is not available. This could be due to authentication issues or the manuscript may not have associated text content.',
        }, { status: 200 })
      }
      
      if (response.status === 404) {
        console.warn('⚠️ No content found for manuscript')
        return NextResponse.json({
          error: 'Content not found',
          fallback: true,
          content: 'No full text content is available for this manuscript.',
        }, { status: 200 })
      }
      
      throw new Error(`Data4Rev API responded with status: ${response.status}`)
    }

    // Get the content type to determine how to handle the response
    const contentType = response.headers.get('content-type') || ''
    
    let content
    if (contentType.includes('application/json')) {
      content = await response.json()
    } else {
      // Handle plain text or other content types
      content = await response.text()
    }

    console.log('✅ Successfully fetched manuscript content from Data4Rev API')
    
    return NextResponse.json({
      success: true,
      content: content,
      contentType: contentType,
      manuscriptId: manuscriptId
    })

  } catch (error) {
    console.error('❌ Error fetching manuscript content from Data4Rev API:', error)
    
    // Return fallback content
    return NextResponse.json({
      error: 'Failed to fetch content',
      fallback: true,
      content: 'Full text content is currently unavailable. This could be due to network issues, authentication problems, or the content may not yet be processed for this manuscript.',
    }, { status: 200 })
  }
}
