import { NextRequest, NextResponse } from 'next/server'
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
    const token = req.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.json({
      valid: true,
      user: decoded,
    })
  } catch (error) {
    log.error('Admin token verification error', error)
    return NextResponse.json({ error: 'Token verification failed' }, { status: 500 })
  }
}

