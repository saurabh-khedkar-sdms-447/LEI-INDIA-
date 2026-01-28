import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken, signCsrfToken, setCsrfTokenCookie } from '@/lib/csrf'
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

  const token = generateCsrfToken()
  const signedToken = signCsrfToken(token)

  const response = NextResponse.json({
    csrfToken: token,
  })

  // Set CSRF token in cookie
  setCsrfTokenCookie(response)

  return response
}
