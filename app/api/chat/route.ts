import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const targetUrl = `${backendUrl.replace(/\/+$/, '')}/chat`

  try {
    const body = await request.text()
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('Content-Type') || 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to proxy chat request', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
