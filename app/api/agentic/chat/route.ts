import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const requestId = `agentic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const targetUrl = `${backendUrl}/agentic/chat`

  try {
    const formData = await request.formData()
    const input = formData.get('input')?.toString()
    const conversation_id = formData.get('conversation_id')?.toString()
    const prefer = formData.get('prefer')?.toString()

    if (!input) {
      return NextResponse.json({ error: "'input' is required" }, { status: 400 })
    }

    const backendResp = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Request-ID': requestId,
      },
      body: new URLSearchParams({
        input,
        ...(conversation_id ? { conversation_id } : {}),
        ...(prefer ? { prefer } : {}),
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
    return NextResponse.json({ error: 'Failed to call agentic chat', details: err?.message || String(err) }, { status: 500 })
  }
}
