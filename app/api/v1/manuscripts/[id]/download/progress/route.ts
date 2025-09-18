import { NextRequest } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';

// Mark this route as dynamic to avoid static rendering issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Store active SSE connections
const activeConnections = new Map<string, WritableStreamDefaultWriter<Uint8Array>>();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Validate authentication (with development bypass)
  let user;
  if (shouldBypassAuth()) {
    console.log("🔧 Development mode - bypassing authentication for SSE");
    user = getDevUser();
  } else {
    user = await validateApiAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }
  }

  const manuscriptId = params.id;
  const connectionId = `${manuscriptId}-${Date.now()}`;

  console.log(`📡 SSE connection established for manuscript: ${manuscriptId}, connection: ${connectionId}`);

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Store the connection for sending updates
      const writer = controller;
      activeConnections.set(connectionId, {
        write: (chunk: Uint8Array) => {
          try {
            controller.enqueue(chunk);
          } catch (error) {
            console.log(`❌ SSE write error for ${connectionId}:`, error);
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (error) {
            console.log(`❌ SSE close error for ${connectionId}:`, error);
          }
        }
      } as any);

      // Send initial connection message
      const initMessage = `data: ${JSON.stringify({
        type: 'connection',
        manuscriptId,
        connectionId,
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      try {
        controller.enqueue(encoder.encode(initMessage));
      } catch (error) {
        console.log(`❌ SSE init error for ${connectionId}:`, error);
      }

      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          // Check if connection is still active before sending heartbeat
          if (activeConnections.has(connectionId)) {
            const heartbeat = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`;
            controller.enqueue(encoder.encode(heartbeat));
          } else {
            clearInterval(heartbeatInterval);
          }
        } catch (error) {
          console.log(`❌ SSE heartbeat error for ${connectionId}:`, error);
          clearInterval(heartbeatInterval);
          activeConnections.delete(connectionId);
        }
      }, 30000); // Every 30 seconds

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        console.log(`🔌 SSE connection closed for ${connectionId}`);
        clearInterval(heartbeatInterval);
        activeConnections.delete(connectionId);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    },
  });
}

// Helper function to send progress updates to all connections for a manuscript
export function sendProgressUpdate(manuscriptId: string, progressData: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({
    type: 'progress',
    manuscriptId,
    ...progressData,
    timestamp: new Date().toISOString()
  })}\n\n`;

  // Send to all connections for this manuscript
  activeConnections.forEach((writer, connectionId) => {
    if (connectionId.startsWith(`${manuscriptId}-`)) {
      try {
        writer.write(encoder.encode(message));
      } catch (error) {
        console.log(`❌ Failed to send progress to ${connectionId}:`, error);
        activeConnections.delete(connectionId);
      }
    }
  });
}

// Helper function to send completion message
export function sendDownloadComplete(manuscriptId: string, completionData: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({
    type: 'complete',
    manuscriptId,
    ...completionData,
    timestamp: new Date().toISOString()
  })}\n\n`;

  // Send to all connections for this manuscript
  activeConnections.forEach((writer, connectionId) => {
    if (connectionId.startsWith(`${manuscriptId}-`)) {
      try {
        writer.write(encoder.encode(message));
        // Close the connection after completion
        setTimeout(() => {
          writer.close();
          activeConnections.delete(connectionId);
        }, 5000); // Keep open for 5 seconds after completion
      } catch (error) {
        console.log(`❌ Failed to send completion to ${connectionId}:`, error);
        activeConnections.delete(connectionId);
      }
    }
  });
}

// Helper function to send error message
export function sendDownloadError(manuscriptId: string, errorData: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({
    type: 'error',
    manuscriptId,
    ...errorData,
    timestamp: new Date().toISOString()
  })}\n\n`;

  // Send to all connections for this manuscript
  activeConnections.forEach((writer, connectionId) => {
    if (connectionId.startsWith(`${manuscriptId}-`)) {
      try {
        writer.write(encoder.encode(message));
      } catch (error) {
        console.log(`❌ Failed to send error to ${connectionId}:`, error);
        activeConnections.delete(connectionId);
      }
    }
  });
}

// Helper function to send cancellation message
export function sendDownloadCancelled(manuscriptId: string, cancellationData: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify({
    type: 'cancelled',
    manuscriptId,
    ...cancellationData,
    timestamp: new Date().toISOString()
  })}\n\n`;

  // Send to all connections for this manuscript
  activeConnections.forEach((writer, connectionId) => {
    if (connectionId.startsWith(`${manuscriptId}-`)) {
      try {
        writer.write(encoder.encode(message));
        // Close the connection after cancellation
        setTimeout(() => {
          writer.close();
          activeConnections.delete(connectionId);
        }, 2000); // Keep open for 2 seconds after cancellation
      } catch (error) {
        console.log(`❌ Failed to send cancellation to ${connectionId}:`, error);
        activeConnections.delete(connectionId);
      }
    }
  });
}