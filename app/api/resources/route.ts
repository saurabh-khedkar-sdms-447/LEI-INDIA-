import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'

// GET /api/resources - public
export async function GET(_req: NextRequest) {
  try {
    const result = await pgPool.query(
      `
      SELECT id, title, type, description, url, "createdAt", "updatedAt"
      FROM "Resource"
      ORDER BY "createdAt" DESC
      `,
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 },
    )
  }
}

