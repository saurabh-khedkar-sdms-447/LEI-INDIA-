import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { productUpdateSchema } from '@/lib/product-validation'
import { checkAdmin } from '@/lib/auth-middleware'
import { sanitizeRichText } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'
import { csrfProtection } from '@/lib/csrf'
import { log } from '@/lib/logger'

// GET /api/products/:id
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
    const { isValidUUID } = await import('@/lib/validation')
    if (!isValidUUID(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const result = await pgPool.query(
      `
      SELECT
        p.id,
        p.description,
        p.mpn,
        p."categoryId",
        p."productType",
        p.coupling,
        p."ipRating" as "degreeOfProtection",
        p."wireCrossSection",
        p."temperatureRange",
        p."cableDiameter",
        p."cableMantleColor",
        p."cableMantleMaterial",
        p."cableLength",
        p."glandMaterial",
        p."housingMaterial",
        p."pinContact",
        p."socketContact",
        p."cableDragChainSuitable",
        p."tighteningTorqueMax",
        p."bendingRadiusFixed",
        p."bendingRadiusRepeated",
        p."contactPlating",
        p.voltage as "operatingVoltage",
        p.current as "ratedCurrent",
        p."halogenFree",
        p."connectorType",
        p.coding as "code",
        p."strippingForce",
        p.images,
        p.documents,
        p."datasheetUrl",
        p."drawingUrl",
        p."createdAt",
        p."updatedAt"
      FROM "Product" p
      WHERE p.id = $1
      `,
      [params.id],
    )
    const product = result.rows[0]

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error: any) {
    log.error('Error fetching product', error)
    
    // Check if this is a missing column error
    if (error?.code === '42703' && error?.message?.includes('categoryId')) {
      return NextResponse.json(
        { 
          error: 'Database schema migration required',
          message: 'The categoryId column is missing. Please run: pnpm migrate:category-id',
          code: 'MIGRATION_REQUIRED'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/:id - update product (admin-only)
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
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = productUpdateSchema.parse(body)

    const existingResult = await pgPool.query(
      `
      SELECT
        id, description, mpn, "categoryId", "productType", coupling, "ipRating",
        "wireCrossSection", "temperatureRange", "cableDiameter",
        "cableMantleColor", "cableMantleMaterial", "cableLength",
        "glandMaterial", "housingMaterial", "pinContact", "socketContact",
        "cableDragChainSuitable", "tighteningTorqueMax",
        "bendingRadiusFixed", "bendingRadiusRepeated", "contactPlating",
        voltage, current, "halogenFree", "connectorType", coding,
        "strippingForce", images, documents, "datasheetUrl", "drawingUrl"
      FROM "Product"
      WHERE id = $1
      `,
      [params.id],
    )
    const existing = existingResult.rows[0]
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Sanitize HTML content fields
    const sanitizedDescription = parsed.description !== undefined 
      ? sanitizeRichText(parsed.description) 
      : existing.description

    const updatedResult = await pgPool.query(
      `
      UPDATE "Product"
      SET
        description = $1,
        "categoryId" = $2,
        mpn = $3,
        "productType" = $4,
        coupling = $5,
        "ipRating" = $6,
        "wireCrossSection" = $7,
        "temperatureRange" = $8,
        "cableDiameter" = $9,
        "cableMantleColor" = $10,
        "cableMantleMaterial" = $11,
        "cableLength" = $12,
        "glandMaterial" = $13,
        "housingMaterial" = $14,
        "pinContact" = $15,
        "socketContact" = $16,
        "cableDragChainSuitable" = $17,
        "tighteningTorqueMax" = $18,
        "bendingRadiusFixed" = $19,
        "bendingRadiusRepeated" = $20,
        "contactPlating" = $21,
        voltage = $22,
        current = $23,
        "halogenFree" = $24,
        "connectorType" = $25,
        coding = $26,
        "strippingForce" = $27,
        images = $28,
        documents = $29,
        "datasheetUrl" = $30,
        "drawingUrl" = $31,
        "updatedAt" = NOW()
      WHERE id = $32
      RETURNING
        id, description,
        "categoryId",
        mpn, "productType", coupling, "ipRating" as "degreeOfProtection",
        "wireCrossSection", "temperatureRange", "cableDiameter",
        "cableMantleColor", "cableMantleMaterial", "cableLength",
        "glandMaterial", "housingMaterial", "pinContact", "socketContact",
        "cableDragChainSuitable", "tighteningTorqueMax",
        "bendingRadiusFixed", "bendingRadiusRepeated", "contactPlating",
        voltage as "operatingVoltage", current as "ratedCurrent", "halogenFree", "connectorType", coding as "code",
        "strippingForce", images, documents, "datasheetUrl", "drawingUrl",
        "createdAt", "updatedAt"
      `,
      [
        sanitizedDescription,
        parsed.categoryId !== undefined ? parsed.categoryId ?? null : existing.categoryId,
        parsed.mpn !== undefined ? parsed.mpn ?? null : existing.mpn,
        parsed.productType !== undefined ? parsed.productType ?? null : existing.productType,
        parsed.coupling !== undefined ? parsed.coupling ?? null : existing.coupling,
        parsed.degreeOfProtection !== undefined ? parsed.degreeOfProtection ?? null : existing.ipRating,
        parsed.wireCrossSection !== undefined ? parsed.wireCrossSection ?? null : existing.wireCrossSection,
        parsed.temperatureRange !== undefined ? parsed.temperatureRange ?? null : existing.temperatureRange,
        parsed.cableDiameter !== undefined ? parsed.cableDiameter ?? null : existing.cableDiameter,
        parsed.cableMantleColor !== undefined ? parsed.cableMantleColor ?? null : existing.cableMantleColor,
        parsed.cableMantleMaterial !== undefined ? parsed.cableMantleMaterial ?? null : existing.cableMantleMaterial,
        parsed.cableLength !== undefined ? parsed.cableLength ?? null : existing.cableLength,
        parsed.glandMaterial !== undefined ? parsed.glandMaterial ?? null : existing.glandMaterial,
        parsed.housingMaterial !== undefined ? parsed.housingMaterial ?? null : existing.housingMaterial,
        parsed.pinContact !== undefined ? parsed.pinContact ?? null : existing.pinContact,
        parsed.socketContact !== undefined ? parsed.socketContact ?? null : existing.socketContact,
        parsed.cableDragChainSuitable !== undefined ? parsed.cableDragChainSuitable ?? null : existing.cableDragChainSuitable,
        parsed.tighteningTorqueMax !== undefined ? parsed.tighteningTorqueMax ?? null : existing.tighteningTorqueMax,
        parsed.bendingRadiusFixed !== undefined ? parsed.bendingRadiusFixed ?? null : existing.bendingRadiusFixed,
        parsed.bendingRadiusRepeated !== undefined ? parsed.bendingRadiusRepeated ?? null : existing.bendingRadiusRepeated,
        parsed.contactPlating !== undefined ? parsed.contactPlating ?? null : existing.contactPlating,
        parsed.operatingVoltage !== undefined ? parsed.operatingVoltage ?? null : existing.voltage,
        parsed.ratedCurrent !== undefined ? parsed.ratedCurrent ?? null : existing.current,
        parsed.halogenFree !== undefined ? parsed.halogenFree ?? null : existing.halogenFree,
        parsed.connectorType !== undefined ? parsed.connectorType ?? null : existing.connectorType,
        parsed.code !== undefined ? parsed.code ?? null : existing.coding,
        parsed.strippingForce !== undefined ? parsed.strippingForce ?? null : existing.strippingForce,
        parsed.images !== undefined ? parsed.images : existing.images,
        parsed.documents !== undefined ? parsed.documents : (existing.documents || []),
        parsed.datasheetUrl !== undefined ? parsed.datasheetUrl ?? null : existing.datasheetUrl,
        parsed.drawingUrl !== undefined ? parsed.drawingUrl ?? null : existing.drawingUrl,
        params.id,
      ],
    )

    return NextResponse.json(updatedResult.rows[0])
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

    log.error('Error updating product', error)
    
    // Check if this is a missing column error
    if (error?.code === '42703' && error?.message?.includes('categoryId')) {
      return NextResponse.json(
        { 
          error: 'Database schema migration required',
          message: 'The categoryId column is missing. Please run: pnpm migrate:category-id',
          code: 'MIGRATION_REQUIRED'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to update product' }, { status: 400 })
  }
}

// DELETE /api/products/:id - delete product (admin-only)
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
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    const existingResult = await pgPool.query(
      `
      SELECT id
      FROM "Product"
      WHERE id = $1
      `,
      [params.id],
    )
    const existing = existingResult.rows[0]
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await pgPool.query(
      `
      DELETE FROM "Product"
      WHERE id = $1
      `,
      [params.id],
    )
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    log.error('Error deleting product', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

