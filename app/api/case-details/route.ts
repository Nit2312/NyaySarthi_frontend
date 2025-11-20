import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = `api-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const targetUrl = `${backendUrl}/api/case-details`;

  console.log(`[${requestId}] Proxying request to: ${targetUrl}`);

  try {
    // Get the form data from the request
    const formData = await request.formData();
    const docId = formData.get('doc_id')?.toString();
    const description = formData.get('description')?.toString();

    if (!docId) {
      console.error(`[${requestId}] Missing required parameter: doc_id`);
      return NextResponse.json(
        { error: 'Missing required parameter: doc_id' },
        { status: 400 }
      );
    }

    // Log the request details (without sensitive data)
    console.log(`[${requestId}] Request details:`, {
      docId: docId ? `${docId.substring(0, 4)}...` : 'none',
      hasDescription: !!description,
    });

    // Forward the request to the backend
    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Request-ID': requestId,
      },
      body: new URLSearchParams({
        doc_id: docId,
        ...(description && { description }),
      }),
    });

    // Clone the response so we can read the body multiple times if needed
    const responseData = await backendResponse.clone().json();
    
    // Log the response status and size
    console.log(`[${requestId}] Backend response status:`, backendResponse.status);
    console.log(`[${requestId}] Backend response keys:`, Object.keys(responseData));

    // Return the backend response
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${requestId}] Error proxying request:`, errorMessage);

    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: errorMessage,
        requestId,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Request-ID, Accept',
      'Access-Control-Max-Age': '600',
    },
  });
}
