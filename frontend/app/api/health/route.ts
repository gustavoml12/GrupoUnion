import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check backend health
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/health`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        frontend: 'healthy',
        backend: data,
      })
    }
    
    return NextResponse.json({
      frontend: 'healthy',
      backend: 'unhealthy',
    }, { status: 503 })
    
  } catch (error) {
    return NextResponse.json({
      frontend: 'healthy',
      backend: 'unreachable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
