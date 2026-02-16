/**
 * Server-side data fetching utilities
 * Direct database queries for optimal performance in React Server Components
 * Eliminates HTTP overhead and enables better caching
 * 
 * Performance optimizations:
 * - Direct DB queries (no HTTP overhead)
 * - Prepared statements (query plan caching)
 * - Optimized indexes (see prisma/performance-indexes.sql)
 * - Parallel fetching support
 */

import { queryWithRetry } from '@/lib/pg'
import { log } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import type { Product, Category } from '@/types'
import { unstable_cache } from 'next/cache'
import { cacheGet, cacheSet } from '@/lib/redis'

export interface ProductsQueryParams {
  categoryId?: string | string[]
  connectorType?: string | string[]
  code?: string | string[]
  degreeOfProtection?: string | string[]
  pins?: number | number[]
  gender?: string | string[]
  inStock?: boolean
  search?: string
  cursor?: string
  limit?: number
  ids?: string[]
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    limit: number
    cursor: string | null
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Generate cache key for products query
 */
function getProductsCacheKey(params: ProductsQueryParams): string {
  const keyParts = ['products']
  
  if (params.categoryId) {
    const ids = Array.isArray(params.categoryId) ? params.categoryId : [params.categoryId]
    keyParts.push(`cat:${ids.sort().join(',')}`)
  }
  if (params.connectorType) {
    const types = Array.isArray(params.connectorType) ? params.connectorType : [params.connectorType]
    keyParts.push(`conn:${types.sort().join(',')}`)
  }
  if (params.code) {
    const codes = Array.isArray(params.code) ? params.code : [params.code]
    keyParts.push(`code:${codes.sort().join(',')}`)
  }
  if (params.degreeOfProtection) {
    const degrees = Array.isArray(params.degreeOfProtection) ? params.degreeOfProtection : [params.degreeOfProtection]
    keyParts.push(`ip:${degrees.sort().join(',')}`)
  }
  if (params.pins !== undefined) {
    const pins = Array.isArray(params.pins) ? params.pins : [params.pins]
    keyParts.push(`pins:${pins.sort().join(',')}`)
  }
  if (params.gender) {
    const genders = Array.isArray(params.gender) ? params.gender : [params.gender]
    keyParts.push(`gen:${genders.sort().join(',')}`)
  }
  if (params.inStock === true) {
    keyParts.push('stock:true')
  }
  if (params.search) {
    keyParts.push(`search:${params.search.trim().toLowerCase()}`)
  }
  if (params.cursor) {
    keyParts.push(`cursor:${params.cursor}`)
  }
  if (params.limit) {
    keyParts.push(`limit:${params.limit}`)
  }
  if (params.ids && params.ids.length > 0) {
    keyParts.push(`ids:${params.ids.sort().join(',')}`)
  }
  
  return keyParts.join('|')
}

/**
 * Fetch products with filters - optimized for server components
 * Direct DB query eliminates HTTP overhead
 * Uses Redis caching for frequently accessed queries
 */
export async function fetchProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
  // Don't cache search queries or queries with cursors (pagination)
  const shouldCache = !params.search && !params.cursor && !params.ids
  
  if (shouldCache) {
    const cacheKey = getProductsCacheKey(params)
    const cached = await cacheGet<ProductsResponse>(cacheKey)
    if (cached) {
      return cached
    }
  }

  try {
    const limit = Math.min(100, Math.max(1, params.limit || 10))
    const validCursor = params.cursor && isValidUUID(params.cursor) ? params.cursor : null

    const filters: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Category filtering: support multiple categoryIds
    if (params.categoryId) {
      const categoryIds = Array.isArray(params.categoryId) 
        ? params.categoryId.filter(isValidUUID)
        : [params.categoryId].filter(isValidUUID)
      
      if (categoryIds.length > 0) {
        if (categoryIds.length === 1) {
          filters.push(`"categoryId" = $${paramIndex}`)
          values.push(categoryIds[0])
          paramIndex++
        } else {
          const placeholders = categoryIds.map(() => `$${paramIndex++}`)
          filters.push(`"categoryId" IN (${placeholders.join(',')})`)
          values.push(...categoryIds)
        }
      }
    }

    // Cursor-based pagination
    if (validCursor) {
      filters.push(`id > $${paramIndex}`)
      values.push(validCursor)
      paramIndex++
    }

    // IDs filter
    if (params.ids && params.ids.length > 0) {
      const validIds = params.ids.filter(isValidUUID)
      if (validIds.length > 0) {
        const placeholders = validIds.map(() => `$${paramIndex++}`)
        filters.push(`id IN (${placeholders.join(',')})`)
        values.push(...validIds)
      }
    }

    // Connector type filter
    if (params.connectorType) {
      const types = Array.isArray(params.connectorType) ? params.connectorType : [params.connectorType]
      if (types.length > 0) {
        const placeholders = types.map(() => `$${paramIndex++}`)
        filters.push(`"connectorType" IN (${placeholders.join(',')})`)
        values.push(...types)
      }
    }

    // Code filter
    if (params.code) {
      const codes = Array.isArray(params.code) ? params.code : [params.code]
      if (codes.length > 0) {
        const placeholders = codes.map(() => `$${paramIndex++}`)
        filters.push(`coding IN (${placeholders.join(',')})`)
        values.push(...codes)
      }
    }

    // Degree of protection filter
    if (params.degreeOfProtection) {
      const degrees = Array.isArray(params.degreeOfProtection) 
        ? params.degreeOfProtection 
        : [params.degreeOfProtection]
      if (degrees.length > 0) {
        const placeholders = degrees.map(() => `$${paramIndex++}`)
        filters.push(`"ipRating" IN (${placeholders.join(',')})`)
        values.push(...degrees)
      }
    }

    // Pins filter
    if (params.pins !== undefined) {
      const pins = Array.isArray(params.pins) ? params.pins : [params.pins]
      if (pins.length > 0) {
        const placeholders = pins.map(() => `$${paramIndex++}`)
        filters.push(`pins IN (${placeholders.join(',')})`)
        values.push(...pins)
      }
    }

    // Gender filter
    if (params.gender) {
      const genders = Array.isArray(params.gender) ? params.gender : [params.gender]
      if (genders.length > 0) {
        const placeholders = genders.map(() => `$${paramIndex++}`)
        filters.push(`gender IN (${placeholders.join(',')})`)
        values.push(...genders)
      }
    }

    // In stock filter
    if (params.inStock === true) {
      filters.push(`"inStock" = true`)
    }

    // Search filter
    if (params.search) {
      const searchTerm = params.search.trim()
      if (searchTerm) {
        filters.push(
          `(name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex + 1} OR description ILIKE $${paramIndex + 2} OR (mpn IS NOT NULL AND mpn ILIKE $${paramIndex + 3}))`,
        )
        values.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`)
        paramIndex += 4
      }
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
    const queryValues = [...values, limit + 1] // Fetch one extra to check if there's a next page

    const productsResult = await queryWithRetry(
      `
      SELECT
        id,
        sku,
        name,
        description,
        mpn,
        "categoryId",
        "productType",
        coupling,
        "ipRating" as "degreeOfProtection",
        "wireCrossSection",
        "temperatureRange",
        "cableDiameter",
        "cableMantleColor",
        "cableMantleMaterial",
        "cableLength",
        "glandMaterial",
        "housingMaterial",
        "pinContact",
        "socketContact",
        "cableDragChainSuitable",
        "tighteningTorqueMax",
        "bendingRadiusFixed",
        "bendingRadiusRepeated",
        "contactPlating",
        voltage as "operatingVoltage",
        current as "ratedCurrent",
        "halogenFree",
        "connectorType",
        coding as "code",
        "strippingForce",
        price,
        "priceType",
        "inStock",
        "stockQuantity",
        images,
        documents,
        "datasheetUrl",
        "drawingUrl",
        "createdAt",
        "updatedAt"
      FROM "Product"
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${queryValues.length}
      `,
      queryValues,
      'fetchProducts',
    )

    const products = productsResult.rows.slice(0, limit) as Product[]
    const hasNext = productsResult.rows.length > limit
    const nextCursor = hasNext && products.length > 0 ? products[products.length - 1].id : null

    const result: ProductsResponse = {
      products,
      pagination: {
        limit,
        cursor: nextCursor,
        hasNext,
        hasPrev: validCursor !== null,
      },
    }

    // Cache the result (TTL: 1-5 minutes depending on query type)
    if (shouldCache) {
      const cacheKey = getProductsCacheKey(params)
      // Cache for 5 minutes for filtered queries, 1 minute for general queries
      const ttl = params.categoryId || params.connectorType || params.inStock ? 300 : 60
      await cacheSet(cacheKey, result, ttl)
    }

    return result
  } catch (error) {
    log.error('Error fetching products', error)
    return {
      products: [],
      pagination: {
        limit: params.limit || 10,
        cursor: null,
        hasNext: false,
        hasPrev: false,
      },
    }
  }
}

/**
 * Fetch a single product by ID - optimized for server components
 * Uses Redis caching (15-30 min TTL) for frequently accessed products
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    if (!isValidUUID(id)) {
      return null
    }

    // Check cache first
    const cacheKey = `product:${id}`
    const cached = await cacheGet<Product>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await queryWithRetry(
      `
      SELECT
        id,
        sku,
        name,
        description,
        mpn,
        "categoryId",
        "productType",
        coupling,
        "ipRating" as "degreeOfProtection",
        "wireCrossSection",
        "temperatureRange",
        "cableDiameter",
        "cableMantleColor",
        "cableMantleMaterial",
        "cableLength",
        "glandMaterial",
        "housingMaterial",
        "pinContact",
        "socketContact",
        "cableDragChainSuitable",
        "tighteningTorqueMax",
        "bendingRadiusFixed",
        "bendingRadiusRepeated",
        "contactPlating",
        voltage as "operatingVoltage",
        current as "ratedCurrent",
        "halogenFree",
        "connectorType",
        coding as "code",
        "strippingForce",
        price,
        "priceType",
        "inStock",
        "stockQuantity",
        images,
        documents,
        "datasheetUrl",
        "drawingUrl",
        "createdAt",
        "updatedAt"
      FROM "Product"
      WHERE id = $1
      `,
      [id],
      'fetchProductById',
    )

    const product = (result.rows[0] || null) as Product | null
    
    // Cache the product (15-30 min TTL for individual products)
    if (product) {
      const cacheKey = `product:${id}`
      await cacheSet(cacheKey, product, 900) // 15 minutes
    }

    return product
  } catch (error) {
    log.error('Error fetching product by ID', error)
    return null
  }
}

/**
 * Fetch categories - optimized for server components
 * Uses Redis caching (5-15 min TTL) for frequently accessed data
 * Falls back to Next.js unstable_cache if Redis unavailable
 */
export async function fetchCategories(params: {
  search?: string
  limit?: number
  page?: number
} = {}): Promise<{ categories: Category[]; total: number }> {
  // Don't cache search queries
  const shouldCache = !params.search
  
  if (shouldCache) {
    const cacheKey = `categories:${params.limit || 1000}:${params.page || 1}`
    const cached = await cacheGet<{ categories: Category[]; total: number }>(cacheKey)
    if (cached) {
      return cached
    }
  }
  
  // For large category lists, also use Next.js cache as fallback
  if (!params.search && params.limit && params.limit >= 50) {
    return unstable_cache(
      async () => {
        const result = await fetchCategoriesInternal(params)
        // Also cache in Redis
        if (shouldCache) {
          const cacheKey = `categories:${params.limit || 1000}:${params.page || 1}`
          await cacheSet(cacheKey, result, 900) // 15 minutes
        }
        return result
      },
      [`categories-${params.limit || 1000}`],
      { revalidate: 300 } // 5 minutes
    )()
  }
  
  const result = await fetchCategoriesInternal(params)
  
  // Cache in Redis
  if (shouldCache) {
    const cacheKey = `categories:${params.limit || 1000}:${params.page || 1}`
    await cacheSet(cacheKey, result, 900) // 15 minutes
  }
  
  return result
}

async function fetchCategoriesInternal(params: {
  search?: string
  limit?: number
  page?: number
} = {}): Promise<{ categories: Category[]; total: number }> {
  try {
    const limit = Math.min(1000, Math.max(1, params.limit || 1000))
    const page = Math.max(1, params.page || 1)
    const skip = (page - 1) * limit

    const values: any[] = []
    let whereClause = ''
    
    if (params.search) {
      const searchTerm = params.search.trim()
      const searchIndex = values.length + 1
      whereClause = `
        WHERE
          (name % $${searchIndex} OR slug % $${searchIndex + 1} OR name ILIKE $${searchIndex + 2} OR slug ILIKE $${searchIndex + 3})
      `
      values.push(searchTerm, searchTerm, `%${searchTerm}%`, `%${searchTerm}%`)
    }

    const dataValues = [...values, limit, skip]
    const categoriesResult = await queryWithRetry(
      `
      WITH filtered_categories AS (
        SELECT 
          id, name, slug, description, image, "parentId", "createdAt", "updatedAt",
          COUNT(*) OVER() AS total
        FROM "Category"
        ${whereClause}
      )
      SELECT * FROM filtered_categories
      ORDER BY "createdAt" ASC
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length}
      `,
      dataValues,
      'fetchCategoriesInternal',
    )
    
    const categories = categoriesResult.rows as (Category & { total?: string })[]
    const total: number = categories.length > 0 ? parseInt(categories[0].total || '0', 10) : 0

    // Remove total from category objects
    const cleanCategories = categories.map(({ total: _, ...cat }) => cat) as Category[]

    return { categories: cleanCategories, total }
  } catch (error) {
    log.error('Error fetching categories', error)
    return { categories: [], total: 0 }
  }
}

/**
 * Fetch category by slug - optimized for server components
 * Uses Redis caching (15 min TTL) for frequently accessed categories
 */
export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  // Check cache first
  const cacheKey = `category:slug:${slug}`
  const cached = await cacheGet<Category>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const result = await queryWithRetry(
      `
      SELECT id, name, slug, description, image, "parentId", "createdAt", "updatedAt"
      FROM "Category"
      WHERE slug = $1
      LIMIT 1
      `,
      [slug],
      'fetchCategoryBySlug',
    )

    const category = (result.rows[0] || null) as Category | null
    
    // Cache the category
    if (category) {
      await cacheSet(cacheKey, category, 900) // 15 minutes
    }

    return category
  } catch (error) {
    log.error('Error fetching category by slug', error)
    return null
  }
}

/**
 * Fetch category by ID - optimized for server components
 * Uses Redis caching (15 min TTL) for frequently accessed categories
 */
export async function fetchCategoryById(id: string): Promise<Category | null> {
  try {
    if (!isValidUUID(id)) {
      return null
    }

    // Check cache first
    const cacheKey = `category:id:${id}`
    const cached = await cacheGet<Category>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await queryWithRetry(
      `
      SELECT id, name, slug, description, image, "parentId", "createdAt", "updatedAt"
      FROM "Category"
      WHERE id = $1
      LIMIT 1
      `,
      [id],
      'fetchCategoryById',
    )

    const category = (result.rows[0] || null) as Category | null
    
    // Cache the category
    if (category) {
      await cacheSet(cacheKey, category, 900) // 15 minutes
    }

    return category
  } catch (error) {
    log.error('Error fetching category by ID', error)
    return null
  }
}
