import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { verifyToken } from '@/lib/jwt'
import { rateLimit } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const token = req.cookies.get('user_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const result = await pgPool.query<{
      id: string
      name: string
      email: string
      company: string | null
      phone: string | null
      role: string
      isActive: boolean
    }>(
      `
      SELECT id, name, email, company, phone, role, "isActive"
      FROM "User"
      WHERE email = $1
      LIMIT 1
      `,
      [decoded.username],
    )

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 },
      )
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company || undefined,
        phone: user.phone || undefined,
        role: user.role,
      },
    })
  } catch (error) {
    log.error('Token verification error', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 },
    )
  }
}

