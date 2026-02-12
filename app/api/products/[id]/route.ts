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
        p.sku,
        p.name,
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
        p.price,
        p."priceType",
        p."inStock",
        p."stockQuantity",
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

    // Validate and normalize arrays to prevent JSON serialization errors
    if (parsed.images !== undefined) {
      if (typeof parsed.images === 'string') {
        try {
          parsed.images = JSON.parse(parsed.images)
        } catch {
          parsed.images = []
        }
      }
      if (!Array.isArray(parsed.images)) {
        parsed.images = []
      }
      // Filter out invalid entries
      parsed.images = parsed.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    }

    if (parsed.documents !== undefined) {
      if (typeof parsed.documents === 'string') {
        try {
          parsed.documents = JSON.parse(parsed.documents)
        } catch {
          parsed.documents = []
        }
      }
      if (!Array.isArray(parsed.documents)) {
        parsed.documents = []
      }
      // Validate document structure
      parsed.documents = parsed.documents.filter((doc): doc is { url: string; filename: string; size?: number } => {
        return doc && typeof doc === 'object' && typeof doc.url === 'string' && doc.url.trim().length > 0
      })
    }

    const existingResult = await pgPool.query(
      `
      SELECT
        id, sku, name, description, mpn, "categoryId", "productType", coupling, "ipRating",
        "wireCrossSection", "temperatureRange", "cableDiameter",
        "cableMantleColor", "cableMantleMaterial", "cableLength",
        "glandMaterial", "housingMaterial", "pinContact", "socketContact",
        "cableDragChainSuitable", "tighteningTorqueMax",
        "bendingRadiusFixed", "bendingRadiusRepeated", "contactPlating",
        voltage, current, "halogenFree", "connectorType", coding,
        "strippingForce", price, "priceType", "inStock", "stockQuantity",
        images, documents, "datasheetUrl", "drawingUrl"
      FROM "Product"
      WHERE id = $1
      `,
      [params.id],
    )
    const existing = existingResult.rows[0]
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Normalize existing.images and existing.documents to ensure they're arrays
    // PostgreSQL JSONB columns are returned as JavaScript objects/arrays by pg library,
    // but we need to ensure they're always arrays
    const normalizeExistingArray = (value: any): any[] => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }
      return []
    }

    // Ensure existing arrays are properly normalized
    if (existing.images !== undefined) {
      existing.images = normalizeExistingArray(existing.images)
    }
    if (existing.documents !== undefined) {
      existing.documents = normalizeExistingArray(existing.documents)
    }

    // Helper to convert empty strings to null for optional fields
    const emptyToNull = (value: any): any => {
      if (value === undefined) return undefined
      if (typeof value === 'string' && value.trim().length === 0) return null
      return value
    }

    // Sanitize HTML content fields
    const sanitizedDescription = parsed.description !== undefined 
      ? sanitizeRichText(parsed.description) 
      : existing.description

    // Prepare JSONB arrays with explicit serialization
    const imagesArray = (() => {
      let arr: string[] = []
      if (parsed.images !== undefined) {
        arr = Array.isArray(parsed.images) 
          ? parsed.images.filter((img: unknown): img is string => typeof img === 'string' && img.trim().length > 0)
          : []
      } else {
        arr = Array.isArray(existing.images) 
          ? existing.images.filter((img: unknown): img is string => typeof img === 'string' && img.trim().length > 0)
          : []
      }
      return arr
    })()

    const documentsArray = (() => {
      let arr: Array<{ url: string; filename: string; size?: number }> = []
      if (parsed.documents !== undefined) {
        arr = Array.isArray(parsed.documents)
          ? parsed.documents.filter((doc: unknown): doc is { url: string; filename: string; size?: number } => {
              if (!doc || typeof doc !== 'object' || doc === null) return false
              if (!('url' in doc)) return false
              const url = (doc as { url: unknown }).url
              if (typeof url !== 'string' || url.trim().length === 0) return false
              return true
            })
          : []
      } else {
        arr = Array.isArray(existing.documents)
          ? existing.documents.filter((doc: unknown): doc is { url: string; filename: string; size?: number } => {
              if (!doc || typeof doc !== 'object' || doc === null) return false
              if (!('url' in doc)) return false
              const url = (doc as { url: unknown }).url
              if (typeof url !== 'string' || url.trim().length === 0) return false
              return true
            })
          : []
      }
      return arr
    })()

    // Serialize arrays to JSON strings for explicit JSONB casting
    const imagesJson = JSON.stringify(imagesArray)
    const documentsJson = JSON.stringify(documentsArray)

    const updatedResult = await pgPool.query(
      `
      UPDATE "Product"
      SET
        sku = $1,
        name = $2,
        description = $3,
        "categoryId" = $4,
        mpn = $5,
        "productType" = $6,
        coupling = $7,
        "ipRating" = $8,
        "wireCrossSection" = $9,
        "temperatureRange" = $10,
        "cableDiameter" = $11,
        "cableMantleColor" = $12,
        "cableMantleMaterial" = $13,
        "cableLength" = $14,
        "glandMaterial" = $15,
        "housingMaterial" = $16,
        "pinContact" = $17,
        "socketContact" = $18,
        "cableDragChainSuitable" = $19,
        "tighteningTorqueMax" = $20,
        "bendingRadiusFixed" = $21,
        "bendingRadiusRepeated" = $22,
        "contactPlating" = $23,
        voltage = $24,
        current = $25,
        "halogenFree" = $26,
        "connectorType" = $27,
        coding = $28,
        "strippingForce" = $29,
        price = $30,
        "priceType" = $31,
        "inStock" = $32,
        "stockQuantity" = $33,
        images = $34::jsonb,
        documents = $35::jsonb,
        "datasheetUrl" = $36,
        "drawingUrl" = $37,
        "updatedAt" = NOW()
      WHERE id = $38
      RETURNING
        id, sku, name, description,
        "categoryId",
        mpn, "productType", coupling, "ipRating" as "degreeOfProtection",
        "wireCrossSection", "temperatureRange", "cableDiameter",
        "cableMantleColor", "cableMantleMaterial", "cableLength",
        "glandMaterial", "housingMaterial", "pinContact", "socketContact",
        "cableDragChainSuitable", "tighteningTorqueMax",
        "bendingRadiusFixed", "bendingRadiusRepeated", "contactPlating",
        voltage as "operatingVoltage", current as "ratedCurrent", "halogenFree", "connectorType", coding as "code",
        "strippingForce", price, "priceType", "inStock", "stockQuantity",
        images, documents, "datasheetUrl", "drawingUrl",
        "createdAt", "updatedAt"
      `,
      [
        parsed.sku !== undefined ? parsed.sku : existing.sku,
        parsed.name !== undefined ? parsed.name : existing.name,
        sanitizedDescription,
        parsed.categoryId !== undefined ? (parsed.categoryId ? parsed.categoryId : null) : existing.categoryId,
        parsed.mpn !== undefined ? emptyToNull(parsed.mpn) : existing.mpn,
        parsed.productType !== undefined ? emptyToNull(parsed.productType) : existing.productType,
        parsed.coupling !== undefined ? emptyToNull(parsed.coupling) : existing.coupling,
        parsed.degreeOfProtection !== undefined ? parsed.degreeOfProtection ?? null : existing.ipRating,
        parsed.wireCrossSection !== undefined ? emptyToNull(parsed.wireCrossSection) : existing.wireCrossSection,
        parsed.temperatureRange !== undefined ? emptyToNull(parsed.temperatureRange) : existing.temperatureRange,
        parsed.cableDiameter !== undefined ? emptyToNull(parsed.cableDiameter) : existing.cableDiameter,
        parsed.cableMantleColor !== undefined ? emptyToNull(parsed.cableMantleColor) : existing.cableMantleColor,
        parsed.cableMantleMaterial !== undefined ? emptyToNull(parsed.cableMantleMaterial) : existing.cableMantleMaterial,
        parsed.cableLength !== undefined ? emptyToNull(parsed.cableLength) : existing.cableLength,
        parsed.glandMaterial !== undefined ? emptyToNull(parsed.glandMaterial) : existing.glandMaterial,
        parsed.housingMaterial !== undefined ? emptyToNull(parsed.housingMaterial) : existing.housingMaterial,
        parsed.pinContact !== undefined ? emptyToNull(parsed.pinContact) : existing.pinContact,
        parsed.socketContact !== undefined ? emptyToNull(parsed.socketContact) : existing.socketContact,
        parsed.cableDragChainSuitable !== undefined ? parsed.cableDragChainSuitable ?? null : existing.cableDragChainSuitable,
        parsed.tighteningTorqueMax !== undefined ? emptyToNull(parsed.tighteningTorqueMax) : existing.tighteningTorqueMax,
        parsed.bendingRadiusFixed !== undefined ? emptyToNull(parsed.bendingRadiusFixed) : existing.bendingRadiusFixed,
        parsed.bendingRadiusRepeated !== undefined ? emptyToNull(parsed.bendingRadiusRepeated) : existing.bendingRadiusRepeated,
        parsed.contactPlating !== undefined ? emptyToNull(parsed.contactPlating) : existing.contactPlating,
        parsed.operatingVoltage !== undefined ? emptyToNull(parsed.operatingVoltage) : existing.voltage,
        parsed.ratedCurrent !== undefined ? emptyToNull(parsed.ratedCurrent) : existing.current,
        parsed.halogenFree !== undefined ? parsed.halogenFree ?? null : existing.halogenFree,
        parsed.connectorType !== undefined ? parsed.connectorType ?? null : existing.connectorType,
        parsed.code !== undefined ? parsed.code ?? null : existing.coding,
        parsed.strippingForce !== undefined ? emptyToNull(parsed.strippingForce) : existing.strippingForce,
        parsed.price !== undefined ? parsed.price ?? null : existing.price,
        parsed.priceType !== undefined ? parsed.priceType : existing.priceType,
        parsed.inStock !== undefined ? parsed.inStock : existing.inStock,
        parsed.stockQuantity !== undefined ? parsed.stockQuantity ?? null : existing.stockQuantity,
        // Use pre-serialized JSON strings with explicit ::jsonb cast
        imagesJson,
        documentsJson,
        parsed.datasheetUrl !== undefined ? emptyToNull(parsed.datasheetUrl) : existing.datasheetUrl,
        parsed.drawingUrl !== undefined ? emptyToNull(parsed.drawingUrl) : existing.drawingUrl,
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

    // Check if this is a JSON serialization error
    if (error?.code === '22P02' || (error?.message && error.message.includes('invalid input syntax for type json'))) {
      log.error('JSON serialization error details', {
        error: error.message,
        detail: error.detail,
        where: error.where,
      })
      return NextResponse.json(
        { 
          error: 'Invalid data format',
          message: 'Failed to serialize product data. Please check images and documents arrays.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 400 }
      )
    }
    
    // Return more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error?.message || 'Failed to update product')
      : 'Failed to update product'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error?.code,
        details: process.env.NODE_ENV === 'development' ? error?.detail : undefined,
      },
      { status: 400 }
    )
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

