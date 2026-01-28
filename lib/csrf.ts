import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'
import { JWT_SECRET } from './env-validation'
import { log } from './logger'

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token'
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create a signed CSRF token
 */
function signCsrfToken(token: string): string {
  const hmac = createHmac('sha256', JWT_SECRET)
  hmac.update(token)
  return `${token}.${hmac.digest('hex')}`
}

/**
 * Verify a signed CSRF token
 */
function verifyCsrfToken(signedToken: string): boolean {
  const [token, signature] = signedToken.split('.')
  if (!token || !signature) {
    return false
  }

  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(token)
    .digest('hex')

  return signature === expectedSignature
}

/**
 * Get CSRF token from request (from cookie or header)
 */
function getCsrfToken(req: NextRequest): string | null {
  // Try header first (for API requests)
  const headerToken = req.headers.get(CSRF_TOKEN_HEADER_NAME)
  if (headerToken) {
    return headerToken
  }

  // Try cookie (for form submissions)
  const cookieToken = req.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Validate CSRF token
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true
  }

  // Skip CSRF check for public read-only endpoints
  const pathname = req.nextUrl.pathname
  const publicReadOnlyEndpoints = ['/api/health', '/api/csrf-token']
  if (publicReadOnlyEndpoints.some((endpoint) => pathname.startsWith(endpoint))) {
    return true
  }

  // For same-origin requests with authenticated users, we can be more lenient
  // but still require CSRF token for security
  const token = getCsrfToken(req)
  if (!token) {
    log.warn('CSRF token missing', { pathname, method: req.method })
    return false
  }

  const isValid = verifyCsrfToken(token)
  if (!isValid) {
    log.warn('CSRF token invalid', { pathname, method: req.method })
    return false
  }

  return true
}

/**
 * CSRF protection middleware
 * Returns null if CSRF check passes, or a NextResponse with 403 if it fails
 */
export function csrfProtection(req: NextRequest): NextResponse | null {
  if (!validateCsrfToken(req)) {
    return NextResponse.json(
      { error: 'CSRF token validation failed' },
      { status: 403 },
    )
  }
  return null
}

/**
 * CSRF protection wrapper for API route handlers
 */
export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const csrfResponse = csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }
    return handler(req)
  }
}

/**
 * Set CSRF token in response cookie
 * Call this in your API route to set the token for the client
 * If token is provided, uses it; otherwise generates a new one
 */
export function setCsrfTokenCookie(res: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateCsrfToken()
  const signedToken = signCsrfToken(csrfToken)
  
  res.cookies.set(CSRF_TOKEN_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return res
}

/**
 * Get CSRF token for client-side use
 * Returns the token that should be sent in X-CSRF-Token header
 */
export function getCsrfTokenForClient(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value
  if (!cookieToken) {
    return null
  }
  
  // Extract the unsigned token part
  const [token] = cookieToken.split('.')
  return token || null
}
