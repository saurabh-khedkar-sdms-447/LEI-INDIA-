import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { pgPool } from '@/lib/pg'
import { checkAdmin } from '@/lib/auth-middleware'
import { log } from '@/lib/logger'
import { csrfProtection } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'

const inquiryUpdateSchema = z.object({
  read: z.boolean().optional(),
  responded: z.boolean().optional(),
  notes: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// GET /api/inquiries/:id - admin
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const auth = checkAdmin(req)
    if (auth instanceof NextResponse) return auth

    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid inquiry ID format' }, { status: 400 })
    }

    const result = await pgPool.query(
      `
      SELECT id, name, email, phone, company, subject, message, read, responded,
             "createdAt", "updatedAt"
      FROM "Inquiry"
      WHERE id = $1
      LIMIT 1
      `,
      [params.id],
    )
    const inquiry = result.rows[0]
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }
    return NextResponse.json(inquiry)
  } catch (error) {
    log.error('Error fetching inquiry', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 },
    )
  }
}

// PUT /api/inquiries/:id - admin update
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const auth = checkAdmin(req)
    if (auth instanceof NextResponse) return auth

    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid inquiry ID format' }, { status: 400 })
    }

    const json = await req.json()
    const data = inquiryUpdateSchema.parse(json)

    const result = await pgPool.query(
      `
      UPDATE "Inquiry"
      SET
        read = COALESCE($1, read),
        responded = COALESCE($2, responded),
        notes = COALESCE($3, notes),
        "updatedAt" = NOW()
      WHERE id = $4
      RETURNING id, name, email, phone, company, subject, message, read, responded, notes,
                "createdAt", "updatedAt"
      `,
      [data.read ?? null, data.responded ?? null, data.notes ?? null, params.id],
    )

    const inquiry = result.rows[0]
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json(inquiry)
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

    log.error('Error updating inquiry', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 400 },
    )
  }
}

// DELETE /api/inquiries/:id - admin
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const auth = checkAdmin(req)
    if (auth instanceof NextResponse) return auth

    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid inquiry ID format' }, { status: 400 })
    }

    const result = await pgPool.query(
      `
      DELETE FROM "Inquiry"
      WHERE id = $1
      RETURNING id
      `,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Inquiry deleted successfully' })
  } catch (error) {
    log.error('Error deleting inquiry', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 },
    )
  }
}

