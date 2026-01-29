import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { requireAdmin } from '@/lib/auth-middleware'
import { contactInfoSchema } from '@/lib/contact-info-validation'
import { log } from '@/lib/logger'
import { csrfProtection } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'

async function getOrCreateContactInfo() {
  try {
    const existing = await pgPool.query(
      `
      SELECT id, phone, email, address, city, state, country, "registeredAddress", "factoryLocation2",
             "regionalBangalore", "regionalKolkata", "regionalGurgaon",
             "createdAt", "updatedAt"
      FROM "ContactInfo"
      ORDER BY "createdAt" ASC
      LIMIT 1
      `,
    )

    if (existing.rows[0]) {
      return existing.rows[0]
    }

    const inserted = await pgPool.query(
      `
      INSERT INTO "ContactInfo" (
        phone, email, address, city, state, country, "registeredAddress", "factoryLocation2",
        "regionalBangalore", "regionalKolkata", "regionalGurgaon",
        "createdAt", "updatedAt"
      )
      VALUES (NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW(), NOW())
      RETURNING id, phone, email, address, city, state, country, "registeredAddress", "factoryLocation2",
                "regionalBangalore", "regionalKolkata", "regionalGurgaon",
                "createdAt", "updatedAt"
      `,
    )

    return inserted.rows[0]
  } catch (error: any) {
    // Check if table doesn't exist
    if (error?.code === '42P01') {
      log.error('ContactInfo table does not exist. Please run the database setup script.', error)
      throw new Error('ContactInfo table does not exist. Please run: npm run setup-db')
    }
    // Re-throw other errors
    throw error
  }
}

// GET /api/contact-info - public
export async function GET(_req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(_req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const contact = await getOrCreateContactInfo()
    return NextResponse.json(contact)
  } catch (error: any) {
    log.error('Failed to fetch contact information', error)
    
    // Extract error details
    const errorMessage = error?.message || String(error) || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'
    const errorDetails = error?.detail || error?.hint || undefined
    
    // Log full error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error object:', {
        message: errorMessage,
        code: errorCode,
        detail: errorDetails,
        stack: error?.stack,
        name: error?.name,
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch contact information',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: process.env.NODE_ENV === 'development' ? errorCode : undefined,
        hint: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 },
    )
  }
}

// PUT /api/contact-info - admin
export const PUT = requireAdmin(async (req: NextRequest) => {
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
    const parsed = contactInfoSchema.parse(body)

    const existing = await getOrCreateContactInfo()

    const updated = await pgPool.query(
      `
      UPDATE "ContactInfo"
      SET
        phone = $1,
        email = $2,
        address = $3,
        city = $4,
        state = $5,
        country = $6,
        "registeredAddress" = $7,
        "factoryLocation2" = $8,
        "regionalBangalore" = $9,
        "regionalKolkata" = $10,
        "regionalGurgaon" = $11,
        "updatedAt" = NOW()
      WHERE id = $12
      RETURNING id, phone, email, address, city, state, country, "registeredAddress", "factoryLocation2",
                "regionalBangalore", "regionalKolkata", "regionalGurgaon",
                "createdAt", "updatedAt"
      `,
      [
        parsed.phone ?? null,
        parsed.email ?? null,
        parsed.address ?? null,
        parsed.city ?? null,
        parsed.state ?? null,
        parsed.country ?? null,
        parsed.registeredAddress ?? null,
        parsed.factoryLocation2 ?? null,
        parsed.regionalContacts?.bangalore ?? null,
        parsed.regionalContacts?.kolkata ?? null,
        parsed.regionalContacts?.gurgaon ?? null,
        existing.id,
      ],
    )

    return NextResponse.json(updated.rows[0])
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

    log.error('Failed to update contact information', error)
    return NextResponse.json(
      { error: 'Failed to update contact information' },
      { status: 400 },
    )
  }
})

