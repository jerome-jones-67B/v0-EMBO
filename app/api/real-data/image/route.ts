import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Mark this route as dynamic to avoid static rendering issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const figure = searchParams.get('figure')
    const panel = searchParams.get('panel')
    const full = searchParams.get('full')
    
    if (!figure) {
      return NextResponse.json({ error: 'Figure parameter required' }, { status: 400 })
    }
    
    const dataPath = 'C:\\Source Code\\embo-data-for-mock\\data-for-mock'
    let imagePath: string
    
    if (panel) {
      // Serve panel thumbnail
      imagePath = path.join(dataPath, figure, 'content', 'thumbnails', panel)
    } else if (full) {
      // Serve full image
      imagePath = path.join(dataPath, figure, 'content', full)
    } else {
      return NextResponse.json({ error: 'Panel or full parameter required' }, { status: 400 })
    }
    
    // Check if file exists
    try {
      await fs.access(imagePath)
    } catch {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    // Read the image file
    const imageBuffer = await fs.readFile(imagePath)
    
    // Determine content type based on file extension
    const ext = path.extname(imagePath).toLowerCase()
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg'
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 })
  }
}
