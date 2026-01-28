import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type UserRole } from '@/lib/jwt'

export type AuthContext = {
  username: string
  role: UserRole
  userId?: string
}

export type AuthOptions = {
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  tokenType?: 'user_token' | 'admin_token'
}

/**
 * Middleware to authenticate and authorize requests
 * Returns the authenticated user context or null if not authenticated
 */
export function authenticateRequest(
  req: NextRequest,
  options: AuthOptions = {},
): AuthContext | null {
  const {
    requireAuth = true,
    allowedRoles,
    tokenType = 'user_token',
  } = options

  const token = req.cookies.get(tokenType)?.value

  if (!token) {
    if (requireAuth) {
      return null
    }
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    if (requireAuth) {
      return null
    }
    return null
  }

  // Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(decoded.role)) {
      return null
    }
  }

  return {
    username: decoded.username,
    role: decoded.role,
  }
}

/**
 * Helper to create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Helper to create a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Helper to check admin authorization (for use inside route handlers with params)
 * Returns the auth context or null if unauthorized
 * Callers should check for null and return the response
 */
export function checkAdmin(req: NextRequest): AuthContext | NextResponse {
  const context = authenticateRequest(req, {
    requireAuth: true,
    allowedRoles: ['admin', 'superadmin'],
    tokenType: 'admin_token',
  })

  if (!context) {
    return forbiddenResponse('Admin access required')
  }

  return context
}

/**
 * Middleware wrapper for admin-only endpoints
 * Requires admin_token cookie and admin or superadmin role
 * Use checkAdmin() helper for route handlers with params
 */
export function requireAdmin(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const context = authenticateRequest(req, {
      requireAuth: true,
      allowedRoles: ['admin', 'superadmin'],
      tokenType: 'admin_token',
    })

    if (!context) {
      return forbiddenResponse('Admin access required')
    }

    return handler(req, context)
  }
}

/**
 * Helper to check customer authorization (for use inside route handlers with params)
 * Returns the auth context or null if unauthorized
 * Callers should check for null and return the response
 */
export function checkCustomer(req: NextRequest): AuthContext | NextResponse {
  const context = authenticateRequest(req, {
    requireAuth: true,
    allowedRoles: ['customer'],
    tokenType: 'user_token',
  })

  if (!context) {
    return unauthorizedResponse('Authentication required')
  }

  return context
}

/**
 * Middleware wrapper for customer-only endpoints
 * Requires user_token cookie and customer role
 * Use checkCustomer() helper for route handlers with params
 */
export function requireCustomer(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const context = authenticateRequest(req, {
      requireAuth: true,
      allowedRoles: ['customer'],
      tokenType: 'user_token',
    })

    if (!context) {
      return unauthorizedResponse('Authentication required')
    }

    return handler(req, context)
  }
}

/**
 * Middleware wrapper for authenticated users (any role)
 * Requires user_token cookie
 */
export function requireAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const context = authenticateRequest(req, {
      requireAuth: true,
      tokenType: 'user_token',
    })

    if (!context) {
      return unauthorizedResponse('Authentication required')
    }

    return handler(req, context)
  }
}

/**
 * Middleware wrapper for optional authentication
 * Returns context if authenticated, null otherwise
 */
export function optionalAuth(
  handler: (
    req: NextRequest,
    context: AuthContext | null,
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const context = authenticateRequest(req, {
      requireAuth: false,
      tokenType: 'user_token',
    })

    return handler(req, context)
  }
}
