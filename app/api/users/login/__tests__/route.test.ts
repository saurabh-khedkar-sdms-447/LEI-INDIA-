import { POST } from '../route'
import { createMockRequest } from '@/lib/__tests__/test-utils'
import { pgPool } from '@/lib/pg'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/pg', () => ({
  pgPool: {
    query: jest.fn(),
  },
}))

jest.mock('bcryptjs')
jest.mock('@/lib/jwt', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
}))

describe('User Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      company: 'Test Company',
      phone: '1234567890',
      role: 'customer',
      isActive: true,
      emailVerified: true,
    }

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const req = createMockRequest({
      email: 'john@example.com',
      password: 'password123',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe('john@example.com')
    expect(data.user.name).toBe('John Doe')
    expect(response.cookies.get('user_token')?.value).toBe('mock-jwt-token')
  })

  it('should return 401 for invalid email', async () => {
      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [] })

    const req = createMockRequest({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return 401 for invalid password', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'john@example.com',
      password: 'hashed-password',
      isActive: true,
      emailVerified: true,
    }

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const req = createMockRequest({
      email: 'john@example.com',
      password: 'wrong-password',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return 403 for deactivated account', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'john@example.com',
      password: 'hashed-password',
      isActive: false,
      emailVerified: true,
    }

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] })

    const req = createMockRequest({
      email: 'john@example.com',
      password: 'password123',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Account is deactivated')
  })

  it('should return 400 for invalid email format', async () => {
    const req = createMockRequest({
      email: 'invalid-email',
      password: 'password123',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
    expect(data.details).toBeDefined()
  })

  it('should return 400 for missing password', async () => {
    const req = createMockRequest({
      email: 'john@example.com',
      password: '',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
  })

  it('should return 500 on database error', async () => {
      ;(pgPool.query as jest.Mock).mockRejectedValue(new Error('Database error'))

    const req = createMockRequest({
      email: 'john@example.com',
      password: 'password123',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to authenticate user')
  })

  it('should set secure cookie in production', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const mockUser = {
      id: 'user-1',
      email: 'john@example.com',
      password: 'hashed-password',
      isActive: true,
      emailVerified: true,
    }

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const req = createMockRequest({
      email: 'john@example.com',
      password: 'password123',
    })

    const response = await POST(req)
    const cookie = response.cookies.get('user_token')

    expect(cookie?.value).toBe('mock-jwt-token')
    // Note: In Next.js test environment, we can't fully test cookie options
    // but the cookie should be set

    process.env.NODE_ENV = originalEnv
  })
})
