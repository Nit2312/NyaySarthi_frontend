import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const requestId = `analyze-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const targetUrl = `${backendUrl}/cases/analyze`

  try {
    const formData = await request.formData()
    const doc_id = formData.get('doc_id')?.toString()
    const title = formData.get('title')?.toString()
    const full_text = formData.get('full_text')?.toString()
    const description = formData.get('description')?.toString()

    if (!doc_id || !full_text) {
      return NextResponse.json({ error: "'doc_id' and 'full_text' are required" }, { status: 400 })
    }

    const backendResp = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Request-ID': requestId,
      },
      body: new URLSearchParams({
        doc_id,
        ...(title ? { title } : {}),
        full_text,
        ...(description ? { description } : {}),
      }).toString(),
    })

    const body = await backendResp.text()
    return new NextResponse(body, {
      status: backendResp.status,
      statusText: backendResp.statusText,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to analyze case', details: err?.message || String(err) }, { status: 500 })
  }
}
