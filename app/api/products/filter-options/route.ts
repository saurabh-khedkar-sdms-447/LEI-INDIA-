import { NextRequest, NextResponse } from 'next/server'
import { pgPool } from '@/lib/pg'
import { rateLimit } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

// GET /api/products/filter-options - get distinct filter values from products
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    // Fetch distinct connector types
    const connectorTypesResult = await pgPool.query(
      `SELECT DISTINCT "connectorType" FROM "Product" WHERE "connectorType" IS NOT NULL ORDER BY "connectorType" ASC`
    )
    const connectorTypes = connectorTypesResult.rows
      .map(row => row.connectorType)
      .filter(Boolean) as string[]

    // Fetch distinct codings
    const codingsResult = await pgPool.query(
      `SELECT DISTINCT coding FROM "Product" WHERE coding IS NOT NULL ORDER BY coding ASC`
    )
    const codings = codingsResult.rows
      .map(row => row.coding)
      .filter(Boolean) as string[]

    // Fetch distinct IP ratings (degreeOfProtection)
    const ipRatingsResult = await pgPool.query(
      `SELECT DISTINCT "ipRating" FROM "Product" WHERE "ipRating" IS NOT NULL ORDER BY "ipRating" ASC`
    )
    const ipRatings = ipRatingsResult.rows
      .map(row => row.ipRating)
      .filter(Boolean) as string[]

    // Fetch distinct pin counts
    const pinsResult = await pgPool.query(
      `SELECT DISTINCT pins FROM "Product" WHERE pins IS NOT NULL ORDER BY pins ASC`
    )
    const pins = pinsResult.rows
      .map(row => row.pins)
      .filter((pin): pin is number => typeof pin === 'number' && !isNaN(pin))

    // Fetch distinct genders
    const gendersResult = await pgPool.query(
      `SELECT DISTINCT gender FROM "Product" WHERE gender IS NOT NULL ORDER BY gender ASC`
    )
    const genders = gendersResult.rows
      .map(row => row.gender)
      .filter(Boolean) as string[]

    return NextResponse.json({
      connectorTypes,
      codings,
      ipRatings,
      pins,
      genders,
    })
  } catch (error) {
    log.error('Error fetching filter options', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch filter options',
        connectorTypes: [],
        codings: [],
        ipRatings: [],
        pins: [],
        genders: [],
      },
      { status: 500 }
    )
  }
}
