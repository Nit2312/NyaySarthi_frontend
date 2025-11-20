import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const requestId = `api-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
  // For search, the backend path is typically "/cases/search" (no extra "/api" prefix)
  const targetUrl = `${backendUrl}/cases/search`

  console.log(`[${requestId}] Proxying search request to: ${targetUrl}`)

  try {
    const formData = await request.formData()
    const input = formData.get('input')?.toString() || ''
    const limit = formData.get('limit')?.toString() || '5'

    if (!input.trim()) {
      console.error(`[${requestId}] Missing required parameter: input`)
      return NextResponse.json(
        { error: 'Missing required parameter: input' },
        { status: 400 }
      )
    }

    // Forward to backend
    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Request-ID': requestId,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({ input, limit }),
    })

    // Attempt to clone+parse for light diagnostics without consuming the stream
    try {
      const cloned = backendResponse.clone()
      const data = await cloned.json()
      console.log(`[${requestId}] Backend response status: ${backendResponse.status}`)
      console.log(`[${requestId}] Backend response keys:`, Array.isArray(data) ? ['array'] : Object.keys(data || {}))
    } catch {
      console.log(`[${requestId}] Backend response status: ${backendResponse.status} (non-JSON or empty body)`)    
    }

    // Return the backend response stream to the client unchanged
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${requestId}] Error proxying search request:`, errorMessage)

    return NextResponse.json(
      {
        error: 'Failed to process search request',
        details: errorMessage,
        requestId,
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Request-ID, Accept',
      'Access-Control-Max-Age': '600',
    },
  })
}
