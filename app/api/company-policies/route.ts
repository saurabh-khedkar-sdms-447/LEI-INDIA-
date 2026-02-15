import { NextRequest, NextResponse } from 'next/server'
import { pgPool, queryWithRetry } from '@/lib/pg'
import { requireAdmin } from '@/lib/auth-middleware'
import { companyPolicySchema, generateSlug } from '@/lib/cms-validation'
import { rateLimit } from '@/lib/rate-limit'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeRichText } from '@/lib/sanitize'
import { log } from '@/lib/logger'

// GET /api/company-policies - public (active only) or all for admin
export async function GET(req: NextRequest) {
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const authHeader = req.headers.get('authorization')
    let isAdmin = false

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyToken } = await import('@/lib/jwt')
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      if (decoded && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
        isAdmin = true
      }
    }

    const result = await queryWithRetry(
      `
      SELECT id, title, slug, content, "policyType", attachments, "displayOrder", active, "createdAt", "updatedAt"
      FROM "CompanyPolicy"
      ${isAdmin ? '' : 'WHERE active = true'}
      ORDER BY "displayOrder" ASC, "createdAt" DESC
      `,
      undefined,
      'fetch company policies',
    )
    // Normalize attachments to always be an array
    const policies = result.rows.map((row) => ({
      ...row,
      attachments: Array.isArray(row.attachments) ? row.attachments : (row.attachments ? [row.attachments] : []),
    }))
    return NextResponse.json(policies)
  } catch (error: any) {
    log.error('Failed to fetch company policies', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch company policies',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 },
    )
  }
}

// POST /api/company-policies - create (admin-only)
export const POST = requireAdmin(async (req: NextRequest) => {
  const csrfResponse = csrfProtection(req)
  if (csrfResponse) {
    return csrfResponse
  }

  const rateLimitResponse = await rateLimit(req, { maxRequests: 20, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const parsed = companyPolicySchema.parse(body)

    // Generate slug if not provided
    const slug = parsed.slug || generateSlug(parsed.title)

    // Check if slug already exists
    const existingSlug = await queryWithRetry(
      `SELECT id FROM "CompanyPolicy" WHERE slug = $1 LIMIT 1`,
      [slug],
      'check slug exists',
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
      INSERT INTO "CompanyPolicy" (
        title, slug, content, "policyType", attachments, "displayOrder", active, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
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
      ],
      'create company policy',
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

    log.error('Failed to create company policy', error)
    return NextResponse.json(
      { error: 'Failed to create company policy' },
      { status: 500 },
    )
  }
})
