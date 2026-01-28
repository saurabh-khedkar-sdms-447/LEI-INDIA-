import { NextRequest } from 'next/server'
import { generateToken } from '../jwt'
import type { UserRole } from '../jwt'

/**
 * Create a mock NextRequest with cookies
 */
export function createMockRequest(
  body?: any,
  cookies: Record<string, string> = {},
  method: string = 'POST',
): NextRequest {
  const url = 'http://localhost:3000/api/test'
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  const request = new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Set cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })

  return request
}

/**
 * Create a mock request with authentication token
 */
export function createAuthenticatedRequest(
  body?: any,
  role: UserRole = 'customer',
  tokenType: 'user_token' | 'admin_token' = 'user_token',
): NextRequest {
  const token = generateToken('test@example.com', role)
  return createMockRequest(body, { [tokenType]: token })
}

/**
 * Mock pgPool.query
 */
export function mockPgQuery(mockFn: jest.Mock) {
  // This will be mocked in the test files using jest.mock
  // This function is kept for compatibility but actual mocking should be done in test files
}

/**
 * Mock pgPool.connect for transaction testing
 */
export function mockPgConnect(mockClient: any) {
  // This will be mocked in the test files using jest.mock
  // This function is kept for compatibility but actual mocking should be done in test files
}

/**
 * Create a mock database client for transactions
 */
export function createMockClient() {
  const query = jest.fn()
  const release = jest.fn()

  return {
    query,
    release,
  }
}
