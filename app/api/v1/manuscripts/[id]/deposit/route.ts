import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { config } from "@/lib/config"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const manuscriptId = params.id
    if (!manuscriptId) {
      return NextResponse.json(
        { error: 'Manuscript ID is required' },
        { status: 400 }
      )
    }

    // Build the Data4Rev API URL
    const data4revApiUrl = `${config.api.baseUrl}/v1/manuscripts/${manuscriptId}/deposit`
    
    console.log(`🚀 Initiating deposit for manuscript ${manuscriptId} to Data4Rev API: ${data4revApiUrl}`)

    // Forward the request to Data4Rev API
    const response = await fetch(data4revApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api.token}`,
        'User-Agent': 'EMBO-Dashboard/1.0',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Data4Rev API deposit failed: ${response.status} ${response.statusText}`, errorText)
      
      // Try to parse error response
      let errorMessage = 'Deposit failed'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`✅ Manuscript ${manuscriptId} successfully deposited to BioStudies`, result)

    return NextResponse.json({
      success: true,
      manuscriptId,
      depositedAt: new Date().toISOString(),
      ...result
    })

  } catch (error) {
    console.error('❌ Deposit API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error during deposit'
      },
      { status: 500 }
    )
  }
}
