import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { heroSlideUpdateSchema } from '@/lib/hero-slide-validation'
import { requireAdmin } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'
import { csrfProtection } from '@/lib/csrf'
import { log } from '@/lib/logger'

// GET /api/hero-slides/[id] - get single hero slide
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid hero slide ID format' }, { status: 400 })
    }

    const result = await pgPool.query(
      `
      SELECT id, title, subtitle, description, image, "ctaText", "ctaLink", 
             "displayOrder", active, "createdAt", "updatedAt"
      FROM "HeroSlide"
      WHERE id = $1
      `,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    log.error('Failed to fetch hero slide', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero slide' },
      { status: 500 },
    )
  }
}

// PUT /api/hero-slides/[id] - update hero slide (admin-only)
export const PUT = requireAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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
    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid hero slide ID format' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = heroSlideUpdateSchema.parse(body)

    // Check if hero slide exists
    const existing = await pgPool.query(
      `SELECT id FROM "HeroSlide" WHERE id = $1`,
      [params.id],
    )

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 },
      )
    }

    // Build dynamic update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (parsed.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`)
      updateValues.push(parsed.title)
    }
    if (parsed.subtitle !== undefined) {
      updateFields.push(`subtitle = $${paramIndex++}`)
      updateValues.push(parsed.subtitle || null)
    }
    if (parsed.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`)
      updateValues.push(parsed.description || null)
    }
    if (parsed.image !== undefined) {
      updateFields.push(`image = $${paramIndex++}`)
      updateValues.push(parsed.image)
    }
    if (parsed.ctaText !== undefined) {
      updateFields.push(`"ctaText" = $${paramIndex++}`)
      updateValues.push(parsed.ctaText || null)
    }
    if (parsed.ctaLink !== undefined) {
      updateFields.push(`"ctaLink" = $${paramIndex++}`)
      updateValues.push(parsed.ctaLink || null)
    }
    if (parsed.displayOrder !== undefined) {
      updateFields.push(`"displayOrder" = $${paramIndex++}`)
      updateValues.push(parsed.displayOrder)
    }
    if (parsed.active !== undefined) {
      updateFields.push(`active = $${paramIndex++}`)
      updateValues.push(parsed.active)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 },
      )
    }

    updateFields.push(`"updatedAt" = NOW()`)
    updateValues.push(params.id)

    const result = await pgPool.query(
      `
      UPDATE "HeroSlide"
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, subtitle, description, image, "ctaText", "ctaLink", 
                "displayOrder", active, "createdAt", "updatedAt"
      `,
      updateValues,
    )

    return NextResponse.json(result.rows[0])
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

    log.error('Error updating hero slide', error)
    return NextResponse.json(
      { error: 'Failed to update hero slide' },
      { status: 500 },
    )
  }
})

// DELETE /api/hero-slides/[id] - delete hero slide (admin-only)
export const DELETE = requireAdmin(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // CSRF protection
  const csrfResponse = csrfProtection(req)
  if (csrfResponse) {
    return csrfResponse
  }

  // Rate limiting
  const rateLimitResponse = await rateLimit(req, { maxRequests: 10, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid hero slide ID format' }, { status: 400 })
    }

    const result = await pgPool.query(
      `DELETE FROM "HeroSlide" WHERE id = $1 RETURNING id`,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Hero slide not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ message: 'Hero slide deleted successfully' })
  } catch (error) {
    log.error('Error deleting hero slide', error)
    return NextResponse.json(
      { error: 'Failed to delete hero slide' },
      { status: 500 },
    )
  }
})
