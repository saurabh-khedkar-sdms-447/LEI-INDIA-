import { NextRequest, NextResponse } from 'next/server'
import { pgPool, queryWithRetry } from '@/lib/pg'
import { companyPolicySchema, generateSlug } from '@/lib/cms-validation'
import { rateLimit } from '@/lib/rate-limit'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeRichText } from '@/lib/sanitize'
import { log } from '@/lib/logger'
import { checkAdmin } from '@/lib/auth-middleware'

// GET /api/company-policies/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const result = await queryWithRetry(
      `
      SELECT id, title, slug, content, "policyType", attachments, "displayOrder", active, "createdAt", "updatedAt"
      FROM "CompanyPolicy"
      WHERE id = $1
      `,
      [params.id],
      'fetch company policy by id',
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Normalize attachments to always be an array
    const policy = {
      ...result.rows[0],
      attachments: Array.isArray(result.rows[0].attachments) 
        ? result.rows[0].attachments 
        : (result.rows[0].attachments ? [result.rows[0].attachments] : []),
    }
    return NextResponse.json(policy)
  } catch (error: any) {
    log.error('Failed to fetch company policy', error)
    return NextResponse.json(
      { error: 'Failed to fetch company policy' },
      { status: 500 },
    )
  }
}

// PUT /api/company-policies/:id - update (admin-only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const csrfResponse = csrfProtection(req)
  if (csrfResponse) {
    return csrfResponse
  }

  const rateLimitResponse = await rateLimit(req, { maxRequests: 20, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const auth = checkAdmin(req)
    if (auth instanceof NextResponse) return auth

    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = companyPolicySchema.parse(body)

    // Generate slug if not provided
    const slug = parsed.slug || generateSlug(parsed.title)

    // Check if slug already exists for another record
    const existingSlug = await queryWithRetry(
      `SELECT id FROM "CompanyPolicy" WHERE slug = $1 AND id != $2 LIMIT 1`,
      [slug, params.id],
      'check slug exists for update',
    )
    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { error: 'A policy with this slug already exists' },
        { status: 400 },
      )
    }

    const sanitizedContent = sanitizeRichText(parsed.content)
    const attachments = parsed.attachments || []

    const result = await queryWithRetry(
      `
      UPDATE "CompanyPolicy"
      SET
        title = $1,
        slug = $2,
        content = $3,
        "policyType" = $4,
        attachments = $5,
        "displayOrder" = $6,
        active = $7,
        "updatedAt" = NOW()
      WHERE id = $8
      RETURNING id, title, slug, content, "policyType", attachments, "displayOrder", active, "createdAt", "updatedAt"
      `,
      [
        parsed.title,
        slug,
        sanitizedContent,
        parsed.policyType || null,
        JSON.stringify(attachments),
        parsed.displayOrder,
        parsed.active,
        params.id,
      ],
      'update company policy',
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Normalize attachments to always be an array
    const policy = {
      ...result.rows[0],
      attachments: Array.isArray(result.rows[0].attachments) 
        ? result.rows[0].attachments 
        : (result.rows[0].attachments ? [result.rows[0].attachments] : []),
    }
    return NextResponse.json(policy)
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

    log.error('Failed to update company policy', error)
    return NextResponse.json(
      { error: 'Failed to update company policy' },
      { status: 500 },
    )
  }
}

// DELETE /api/company-policies/:id - delete (admin-only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const csrfResponse = csrfProtection(req)
  if (csrfResponse) {
    return csrfResponse
  }

  const rateLimitResponse = await rateLimit(req, { maxRequests: 20, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const auth = checkAdmin(req)
    if (auth instanceof NextResponse) return auth

    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const result = await queryWithRetry(
      `DELETE FROM "CompanyPolicy" WHERE id = $1 RETURNING id`,
      [params.id],
      'delete company policy',
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    log.error('Failed to delete company policy', error)
    return NextResponse.json(
      { error: 'Failed to delete company policy' },
      { status: 500 },
    )
  }
}
