import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'quovarine',
      version: '0.1.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
