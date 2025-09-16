import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';

// Mark this route as dynamic to avoid static rendering issues
export const dynamic = 'force-dynamic'

// Mock file data
const mockFiles = [
  {
    filename: "manuscript.pdf",
    content_type: "application/pdf",
    size: 2048576,
    id: 1
  },
  {
    filename: "supplementary_data.xlsx",
    content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 1024000,
    id: 2
  },
  {
    filename: "figure_1.tiff",
    content_type: "image/tiff",
    size: 512000,
    id: 3
  }
];

export async function GET(request: NextRequest) {
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

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pagesize = parseInt(searchParams.get('pagesize') || '20');

    // Paginate
    const startIndex = page * pagesize;
    const endIndex = startIndex + pagesize;
    const paginatedFiles = mockFiles.slice(startIndex, endIndex);

    const response = {
      files: paginatedFiles,
      total: mockFiles.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Mock file upload - in real implementation, this would save the file
    const newFile = {
      filename: file.name,
      content_type: file.type,
      size: file.size,
      id: Date.now()
    };

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
