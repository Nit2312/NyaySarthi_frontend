import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: any) {
  const { params } = context
  const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
  const targetUrl = `${backendUrl}/api/analyze-document/${encodeURIComponent(params.analysisId)}`

  try {
    const res = await fetch(targetUrl, { method: 'GET', cache: 'no-store' })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to proxy analyze-document fetch',
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}
