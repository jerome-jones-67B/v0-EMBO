import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { sendProgressUpdate, sendDownloadComplete, sendDownloadError, sendDownloadCancelled } from './progress/route';
import JSZip from 'jszip';

// Mark this route as dynamic to avoid static rendering issues
export const dynamic = 'force-dynamic'

// Data4Rev API endpoint (base URL without /v1 suffix) - backend only
const DATA4REV_API_BASE = process.env.DATA4REV_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api';

// Helper function to get authentication headers
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const authToken = process.env.DATA4REV_AUTH_TOKEN || process.env.AUTH_TOKEN;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
}

// Helper function to fetch manuscript details from Data4Rev API
async function fetchManuscriptDetails(manuscriptId: string) {
  const apiUrl = `${DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}`;
  
  console.log('🔍 Fetching manuscript details from Data4Rev API:', apiUrl);
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: getApiHeaders(),
    signal: AbortSignal.timeout(15000) // 15 second timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch manuscript details: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to download a file from Data4Rev API
async function downloadFileFromApi(manuscriptId: string, fileId: number, signal?: AbortSignal): Promise<{ blob: Blob, filename: string, contentType: string }> {
  const apiUrl = `${DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/files/${fileId}/download`;
  
  console.log('📥 Downloading file from Data4Rev API:', apiUrl);
  
  // Combine the request signal with a timeout
  const timeoutSignal = AbortSignal.timeout(30000); // 30 second timeout for file downloads
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: getApiHeaders(),
    signal: combinedSignal
  });

  if (!response.ok) {
    throw new Error(`Failed to download file ${fileId}: ${response.status} ${response.statusText}`);
  }

  // Extract filename from Content-Disposition header or use file ID as fallback
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `file_${fileId}`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
  const blob = await response.blob();

  return { blob, filename, contentType };
}

// Mock fallback data for when API is unavailable
const getMockFilesForManuscript = (msid: string) => [
  {
    filename: "manuscript.pdf",
    content_type: "application/pdf",
    size: 1500000,
    data: `Mock PDF content for ${msid} manuscript`
  },
  {
    filename: "metadata.json", 
    content_type: "application/json",
    size: 1024,
    data: JSON.stringify({
      msid: msid,
      title: `Manuscript ${msid}`,
      status: "available",
      download_date: new Date().toISOString(),
      note: "This is mock data - API was unavailable"
    }, null, 2)
  }
];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const manuscriptId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'zip'; // zip, individual, list
    const fileType = searchParams.get('type'); // figures, supplementary, manuscript, metadata, all

    console.log(`📥 Download request for manuscript: ${manuscriptId}, format: ${format}, type: ${fileType}`);

    // Check if request was aborted before starting
    if (request.signal?.aborted) {
      console.log(`🛑 Download request aborted before starting for manuscript: ${manuscriptId}`);
      sendDownloadCancelled(manuscriptId, {
        status: 'Download cancelled',
        progress: 0,
        step: 'cancelled',
        message: 'Download was cancelled before starting'
      });
      return NextResponse.json({ error: 'Download cancelled' }, { status: 499 }); // Client Closed Request
    }

    // Send initial progress update
    sendProgressUpdate(manuscriptId, {
      status: 'Initializing download...',
      progress: 0,
      step: 'init'
    });

    let manuscriptDetails;
    let useApiData = true;

    try {
      // Send connection progress
      sendProgressUpdate(manuscriptId, {
        status: 'Connecting to Data4Rev API...',
        progress: 10,
        step: 'connecting'
      });

      // Try to fetch manuscript details from Data4Rev API
      manuscriptDetails = await fetchManuscriptDetails(manuscriptId);
      console.log(`✅ Fetched manuscript details from API: ${manuscriptDetails.files?.length || 0} files found`);
      
      sendProgressUpdate(manuscriptId, {
        status: 'Manuscript details retrieved...',
        progress: 20,
        step: 'details_fetched',
        totalFiles: manuscriptDetails.files?.length || 0
      });
    } catch (apiError) {
      console.warn('⚠️ Failed to fetch from Data4Rev API, falling back to mock data:', apiError);
      useApiData = false;
      
      sendProgressUpdate(manuscriptId, {
        status: 'Using local data...',
        progress: 20,
        step: 'fallback_data'
      });
    }

    let filesToDownload = [];
    
    if (useApiData && manuscriptDetails?.files) {
      // Use real API data
      let allFiles = manuscriptDetails.files;
      
      // Categorize files for better organization
      const categorizedFiles = {
        manuscript: allFiles.filter((file: any) => {
          const filename = file.name.toLowerCase();
          const filepath = file.uri?.toLowerCase() || '';
          return filename.includes('.pdf') || 
                 filepath.includes('/pdf/') || 
                 filename.includes('.docx') && filepath.includes('/doc/');
        }),
        figures: allFiles.filter((file: any) => {
          const filename = file.name.toLowerCase();
          const filepath = file.uri?.toLowerCase() || '';
          return (filename.includes('.png') || filename.includes('.jpg') || 
                 filename.includes('.jpeg') || filename.includes('.tiff') || 
                 filename.includes('.gif') || filename.includes('.svg') ||
                 filename.includes('.pdf') || filename.includes('.eps')) && 
                 (filepath.includes('/graphic/') || filepath.includes('/figure'));
        }),
        supplementary: allFiles.filter((file: any) => {
          const filename = file.name.toLowerCase();
          const filepath = file.uri?.toLowerCase() || '';
          return filepath.includes('/suppl_data/') || 
                 filename.includes('supplement') ||
                 filename.includes('.xlsx') ||
                 filename.includes('.csv') ||
                 filename.includes('data') ||
                 filename.includes('.zip');
        }),
        metadata: allFiles.filter((file: any) => {
          const filename = file.name.toLowerCase();
          return filename.includes('.xml') || filename.includes('.json');
        }),
        thumbnails: allFiles.filter((file: any) => {
          const filename = file.name.toLowerCase();
          const filepath = file.uri?.toLowerCase() || '';
          return filename.includes('thumbnail') || 
                 filename.includes('preview') ||
                 filepath.includes('.preview.');
        })
      };
      
      // Log file categorization for debugging
      console.log(`📊 File categorization for manuscript ${manuscriptId}:`, {
        total: allFiles.length,
        manuscript: categorizedFiles.manuscript.length,
        figures: categorizedFiles.figures.length,
        supplementary: categorizedFiles.supplementary.length,
        metadata: categorizedFiles.metadata.length,
        thumbnails: categorizedFiles.thumbnails.length
      });
      
      // Filter files by type if specified
      if (fileType && fileType !== 'all') {
        switch (fileType) {
          case 'figures':
            filesToDownload = categorizedFiles.figures;
            break;
          case 'supplementary':
            filesToDownload = categorizedFiles.supplementary;
            break;
          case 'manuscript':
            filesToDownload = categorizedFiles.manuscript;
            break;
          case 'metadata':
            filesToDownload = categorizedFiles.metadata;
            break;
          case 'essential':
            // Essential files: manuscript PDFs, main figures, key data (exclude thumbnails/previews)
            filesToDownload = [
              ...categorizedFiles.manuscript,
              ...categorizedFiles.figures,
              ...categorizedFiles.supplementary.filter((file: any) => {
                const filename = file.name.toLowerCase();
                // Include data files but exclude thumbnails and previews
                return !filename.includes('thumbnail') && 
                       !filename.includes('preview') &&
                       !file.uri?.toLowerCase().includes('.preview.');
              })
            ];
            break;
          default:
            filesToDownload = allFiles;
        }
      } else {
        // Default to essential files instead of all files
        filesToDownload = [
          ...categorizedFiles.manuscript,
          ...categorizedFiles.figures,
          ...categorizedFiles.supplementary.filter((file: any) => {
            const filename = file.name.toLowerCase();
            return !filename.includes('thumbnail') && 
                   !filename.includes('preview') &&
                   !file.uri?.toLowerCase().includes('.preview.');
          })
        ];
        
        console.log(`📦 Defaulting to essential files (${filesToDownload.length}/${allFiles.length}). Use type=all for complete archive.`);
      }
    } else {
      // Fallback to mock data
      const mockFiles = getMockFilesForManuscript(manuscriptId);
      filesToDownload = mockFiles;
      
      if (fileType && fileType !== 'all') {
        filesToDownload = mockFiles.filter(file => {
          switch (fileType) {
            case 'figures':
              return file.content_type.startsWith('image/');
            case 'supplementary':
              return file.filename.toLowerCase().includes('supplement') || 
                     file.content_type.includes('spreadsheet');
            case 'manuscript':
              return file.content_type === 'application/pdf' && file.filename.includes('manuscript');
            case 'metadata':
              return file.content_type === 'application/json';
            default:
              return true;
          }
        });
      }
    }

    if (filesToDownload.length === 0) {
      return NextResponse.json(
        { error: `No files found for manuscript ${manuscriptId} with type ${fileType || 'all'}` },
        { status: 404 }
      );
    }

    // Handle different response formats
    if (format === 'list') {
      // Return list of available files
      const fileList = filesToDownload.map((file: any) => useApiData ? ({
        id: file.id,
        filename: file.name,
        uri: file.uri,
        preview_uri: file.preview_uri,
        source: file.source,
        uploaded_by: file.uploaded_by
      }) : ({
        filename: file.filename,
        content_type: file.content_type,
        size: file.size
      }));
      
      return NextResponse.json({
        manuscript_id: manuscriptId,
        files: fileList,
        total_files: fileList.length,
        data_source: useApiData ? 'api' : 'mock'
      });
    }

    // Create ZIP file with all requested files
    const zip = new JSZip();
    const downloadedFiles = [];

    sendProgressUpdate(manuscriptId, {
      status: `Starting download of ${filesToDownload.length} files...`,
      progress: 30,
      step: 'download_start',
      totalFiles: filesToDownload.length,
      downloadedFiles: 0
    });

    for (let i = 0; i < filesToDownload.length; i++) {
      // Check if request was aborted during file processing
      if (request.signal?.aborted) {
        console.log(`🛑 Download request aborted during file processing for manuscript: ${manuscriptId}`);
        sendDownloadCancelled(manuscriptId, {
          status: 'Download cancelled',
          progress: Math.round((i / filesToDownload.length) * 100),
          step: 'cancelled',
          totalFiles: filesToDownload.length,
          downloadedFiles: i,
          message: `Download was cancelled after processing ${i} of ${filesToDownload.length} files`
        });
        return NextResponse.json({ error: 'Download cancelled' }, { status: 499 });
      }

      const file = filesToDownload[i];
      const currentFileNum = i + 1;
      const progressPercent = Math.min(85, 30 + ((currentFileNum / filesToDownload.length) * 55));
      
      try {
        if (useApiData) {
          // Send file-specific progress update
          sendProgressUpdate(manuscriptId, {
            status: `Downloading file ${currentFileNum}/${filesToDownload.length}...`,
            progress: progressPercent,
            step: 'downloading_file',
            totalFiles: filesToDownload.length,
            downloadedFiles: i,
            currentFile: file.name || `file_${file.id}`,
            currentFileId: file.id
          });

          // Download file from Data4Rev API
          const { blob, filename, contentType } = await downloadFileFromApi(manuscriptId, file.id, request.signal);
          const fileBuffer = await blob.arrayBuffer();
          const fileSizeMB = (fileBuffer.byteLength / (1024 * 1024)).toFixed(1);
          
          zip.file(filename, fileBuffer);
          downloadedFiles.push({
            filename,
            size: fileBuffer.byteLength,
            content_type: contentType,
            source: 'api'
          });
          
          console.log(`✅ Downloaded file ${currentFileNum}/${filesToDownload.length}: ${filename} (${fileBuffer.byteLength} bytes)`);
          
          // Send file completion update
          sendProgressUpdate(manuscriptId, {
            status: `Downloaded ${filename} (${fileSizeMB}MB)`,
            progress: progressPercent,
            step: 'file_completed',
            totalFiles: filesToDownload.length,
            downloadedFiles: currentFileNum,
            currentFile: filename,
            currentFileSize: fileSizeMB + 'MB'
          });
        } else {
          // Use mock data
          sendProgressUpdate(manuscriptId, {
            status: `Processing file ${currentFileNum}/${filesToDownload.length}...`,
            progress: progressPercent,
            step: 'processing_file',
            totalFiles: filesToDownload.length,
            downloadedFiles: i,
            currentFile: file.filename
          });

          zip.file(file.filename, file.data);
          downloadedFiles.push({
            filename: file.filename,
            size: file.size,
            content_type: file.content_type,
            source: 'mock'
          });

          sendProgressUpdate(manuscriptId, {
            status: `Processed ${file.filename}`,
            progress: progressPercent,
            step: 'file_completed',
            totalFiles: filesToDownload.length,
            downloadedFiles: currentFileNum,
            currentFile: file.filename
          });
        }
      } catch (fileError) {
        console.error(`❌ Failed to download file ${useApiData ? file.id : file.filename}:`, fileError);
        
        sendProgressUpdate(manuscriptId, {
          status: `Failed to download file ${currentFileNum}/${filesToDownload.length}`,
          progress: progressPercent,
          step: 'file_error',
          totalFiles: filesToDownload.length,
          downloadedFiles: i,
          currentFile: useApiData ? file.name || `file_${file.id}` : file.filename,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });

        // Continue with other files, add error info to manifest
        downloadedFiles.push({
          filename: useApiData ? `file_${file.id}_error.txt` : `${file.filename}_error.txt`,
          size: 0,
          content_type: 'text/plain',
          source: 'error',
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    // Send packaging progress update
    sendProgressUpdate(manuscriptId, {
      status: 'Packaging files into ZIP...',
      progress: 85,
      step: 'packaging',
      totalFiles: filesToDownload.length,
      downloadedFiles: downloadedFiles.length
    });

    // Add a download manifest
    const manifest = {
      manuscript_id: manuscriptId,
      download_date: new Date().toISOString(),
      files: downloadedFiles,
      total_files: downloadedFiles.length,
      successful_downloads: downloadedFiles.filter(f => f.source !== 'error').length,
      failed_downloads: downloadedFiles.filter(f => f.source === 'error').length,
      data_source: useApiData ? 'data4rev_api' : 'mock_data',
      user: user.email || user.name || 'Unknown',
      filter_type: fileType || 'all'
    };
    
    zip.file('download_manifest.json', JSON.stringify(manifest, null, 2));

    // Generate ZIP buffer
    sendProgressUpdate(manuscriptId, {
      status: 'Finalizing ZIP package...',
      progress: 95,
      step: 'finalizing'
    });

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    
    // Get MSID from manuscript details or use manuscriptId as fallback
    const msid = useApiData ? manuscriptDetails?.msid || manuscriptId : manuscriptId;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    const zipFilename = `${msid}_${timestamp}.zip`;
    const fileSizeMB = (zipBuffer.byteLength / (1024 * 1024)).toFixed(1);

    console.log(`✅ Generated ZIP file: ${zipFilename} (${zipBuffer.byteLength} bytes, ${downloadedFiles.length} files)`);

    // Send completion update
    sendDownloadComplete(manuscriptId, {
      status: 'Download completed!',
      progress: 100,
      step: 'completed',
      filename: zipFilename,
      fileSize: fileSizeMB + 'MB',
      totalFiles: downloadedFiles.length,
      successfulFiles: downloadedFiles.filter(f => f.source !== 'error').length,
      failedFiles: downloadedFiles.filter(f => f.source === 'error').length
    });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipBuffer.byteLength.toString(),
        'X-Data-Source': useApiData ? 'api' : 'mock',
        'X-File-Count': downloadedFiles.length.toString()
      },
    });

  } catch (error) {
    console.error('❌ Error generating download:', error);
    
    // Send error update via SSE
    sendDownloadError(params.id, {
      status: 'Download failed',
      progress: 0,
      step: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate download package',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for requesting custom download packages
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const manuscriptId = params.id;
    const body = await request.json();
    const { selectedFiles, packageName, includeMetadata = true } = body;

    console.log(`📦 Custom download request for manuscript: ${manuscriptId}`);

    let manuscriptDetails: any;
    let useApiData = true;
    let allFiles: any[] = [];

    try {
      // Try to fetch manuscript details from Data4Rev API
      manuscriptDetails = await fetchManuscriptDetails(manuscriptId);
      allFiles = manuscriptDetails.files || [];
      console.log(`✅ Fetched ${allFiles.length} files from API for custom download`);
    } catch (apiError) {
      console.warn('⚠️ Failed to fetch from Data4Rev API, falling back to mock data:', apiError);
      useApiData = false;
      allFiles = getMockFilesForManuscript(manuscriptId);
    }

    // Filter to selected files only
    let filesToPackage: any[] = [];
    if (useApiData) {
      // For API data, filter by file IDs or names
      filesToPackage = allFiles.filter((file: any) => 
        selectedFiles.includes(file.id) || selectedFiles.includes(file.name)
      );
    } else {
      // For mock data, filter by filename
      filesToPackage = allFiles.filter((file: any) => 
        selectedFiles.includes(file.filename)
      );
    }

    if (filesToPackage.length === 0) {
      return NextResponse.json(
        { error: 'No valid files selected for download' },
        { status: 400 }
      );
    }

    // Create custom ZIP package
    const zip = new JSZip();
    const downloadedFiles: any[] = [];
    
    for (const file of filesToPackage) {
      try {
        if (useApiData) {
          // Download file from Data4Rev API  
          const { blob, filename, contentType } = await downloadFileFromApi(manuscriptId, file.id, request.signal);
          const fileBuffer = await blob.arrayBuffer();
          
          zip.file(filename, fileBuffer);
          downloadedFiles.push({
            filename,
            size: fileBuffer.byteLength,
            content_type: contentType,
            source: 'api'
          });
        } else {
          // Use mock data
          zip.file(file.filename, file.data);
          downloadedFiles.push({
            filename: file.filename,
            size: file.size,
            content_type: file.content_type,
            source: 'mock'
          });
        }
      } catch (fileError) {
        console.error(`❌ Failed to download file ${useApiData ? file.id : file.filename}:`, fileError);
        downloadedFiles.push({
          filename: useApiData ? `file_${file.id}_error.txt` : `${file.filename}_error.txt`,
          size: 0,
          content_type: 'text/plain',
          source: 'error',
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    if (includeMetadata) {
      const customManifest = {
        manuscript_id: manuscriptId,
        package_name: packageName || 'custom_package',
        created_by: user.email || user.name || 'Unknown',
        created_date: new Date().toISOString(),
        selected_files: downloadedFiles.map((f: any) => f.filename),
        total_files: downloadedFiles.length,
        successful_downloads: downloadedFiles.filter((f: any) => f.source !== 'error').length,
        failed_downloads: downloadedFiles.filter((f: any) => f.source === 'error').length,
        data_source: useApiData ? 'data4rev_api' : 'mock_data'
      };
      
      zip.file('package_info.json', JSON.stringify(customManifest, null, 2));
    }

        const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
        
        // Get MSID from manuscript details or use manuscriptId as fallback
        const msid = useApiData ? manuscriptDetails?.msid || manuscriptId : manuscriptId;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
        const customFilename = `${msid}_${packageName || 'custom'}_${timestamp}.zip`;

    console.log(`✅ Generated custom ZIP: ${customFilename} (${zipBuffer.byteLength} bytes, ${downloadedFiles.length} files)`);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${customFilename}"`,
        'Content-Length': zipBuffer.byteLength.toString(),
        'X-Data-Source': useApiData ? 'api' : 'mock',
        'X-File-Count': downloadedFiles.length.toString()
      },
    });

  } catch (error) {
    console.error('❌ Error creating custom download package:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create custom download package',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
