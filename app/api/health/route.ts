import { NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { log } from '@/lib/logger'

export async function GET() {
  try {
    // Check database connectivity
    await pgPool.query('SELECT 1')
    
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
      { status: 200 },
    )
  } catch (error) {
    // Database connection failed
    log.error('Health check failed - database connection error', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: process.env.NODE_ENV === 'production' ? 'Database connection failed' : String(error),
      },
      { status: 503 },
    )
  }
}
