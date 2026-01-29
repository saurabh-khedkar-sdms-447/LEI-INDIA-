import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken, setCsrfTokenCookie } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /api/csrf-token - Get CSRF token for client
 * This endpoint provides CSRF tokens that clients can use for state-changing operations
 */
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Generate a CSRF token that will be stored (signed) in a cookie and
  // returned (unsigned) to the client so it can be sent in the X-CSRF-Token header.
  const token = generateCsrfToken()

  const response = NextResponse.json({
    csrfToken: token,
  })

  // Set CSRF token in cookie – ensure the same token is used for both
  // the cookie (signed) and the JSON response (unsigned).
  setCsrfTokenCookie(response, token)

  return response
}
