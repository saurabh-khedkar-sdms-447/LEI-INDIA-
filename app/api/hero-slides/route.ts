import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { verifyToken } from '@/lib/jwt'
import { heroSlideSchema } from '@/lib/hero-slide-validation'
import { requireAdmin } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'
import { csrfProtection } from '@/lib/csrf'
import { log } from '@/lib/logger'

// GET /api/hero-slides - public (active only) or all for admin
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const authHeader = req.headers.get('authorization')
    let isAdmin = false

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      if (decoded && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
        isAdmin = true
      }
    }

    const result = await pgPool.query(
      `
      SELECT id, title, subtitle, description, image, "ctaText", "ctaLink", 
             "displayOrder", active, "createdAt", "updatedAt"
      FROM "HeroSlide"
      ${isAdmin ? '' : 'WHERE active = true'}
      ORDER BY "displayOrder" ASC, "createdAt" DESC
      `,
    )
    return NextResponse.json(result.rows)
  } catch (error: any) {
    log.error('Failed to fetch hero slides', error)
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'
    return NextResponse.json(
      { 
        error: 'Failed to fetch hero slides',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: process.env.NODE_ENV === 'development' ? errorCode : undefined,
      },
      { status: 500 },
    )
  }
}

// POST /api/hero-slides - create hero slide (admin-only)
export const POST = requireAdmin(async (req: NextRequest) => {
  // CSRF protection
  const csrfResponse = csrfProtection(req)
  if (csrfResponse) {
    return csrfResponse
  }

  // Rate limiting
  const rateLimitResponse = await rateLimit(req, { maxRequests: 20, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const parsed = heroSlideSchema.parse(body)

    const result = await pgPool.query(
      `
      INSERT INTO "HeroSlide" (
        title, subtitle, description, image, "ctaText", "ctaLink", 
        "displayOrder", active, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, title, subtitle, description, image, "ctaText", "ctaLink", 
                "displayOrder", active, "createdAt", "updatedAt"
      `,
      [
        parsed.title,
        parsed.subtitle || null,
        parsed.description || null,
        parsed.image,
        parsed.ctaText || null,
        parsed.ctaLink || null,
        parsed.displayOrder || 0,
        parsed.active !== undefined ? parsed.active : true,
      ],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors?.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      )
    }

    log.error('Error creating hero slide', error)
    return NextResponse.json(
      { error: 'Failed to create hero slide' },
      { status: 500 },
    )
  }
})
