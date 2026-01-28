import { generateToken, verifyToken, type UserRole } from '../jwt'

describe('JWT Library', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing'
    process.env.JWT_EXPIRES_IN = '1h'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('generateToken', () => {
    it('should generate a valid token for a customer', () => {
      const token = generateToken('test@example.com', 'customer')
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })

    it('should generate a valid token for an admin', () => {
      const token = generateToken('admin@example.com', 'admin')
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })

    it('should generate a valid token for a superadmin', () => {
      const token = generateToken('superadmin@example.com', 'superadmin')
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })

    it('should default to customer role when role is not provided', () => {
      const token = generateToken('user@example.com')
      const decoded = verifyToken(token)
      expect(decoded?.role).toBe('customer')
    })

    it('should throw error when JWT_SECRET is not configured', () => {
      delete process.env.JWT_SECRET
      jest.isolateModules(() => {
        // Re-import after deleting JWT_SECRET
        const { generateToken: genToken } = require('../jwt')
        
        expect(() => {
          genToken('test@example.com')
        }).toThrow('JWT_SECRET is not configured')
      })
    })

    it('should use custom expiration time from env', () => {
      process.env.JWT_EXPIRES_IN = '2h'
      const token = generateToken('test@example.com')
      expect(token).toBeDefined()
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token and return user data', () => {
      const token = generateToken('test@example.com', 'customer')
      const decoded = verifyToken(token)

      expect(decoded).not.toBeNull()
      expect(decoded?.username).toBe('test@example.com')
      expect(decoded?.role).toBe('customer')
    })

    it('should verify token with admin role', () => {
      const token = generateToken('admin@example.com', 'admin')
      const decoded = verifyToken(token)

      expect(decoded).not.toBeNull()
      expect(decoded?.username).toBe('admin@example.com')
      expect(decoded?.role).toBe('admin')
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const decoded = verifyToken(invalidToken)
      expect(decoded).toBeNull()
    })

    it('should return null for tampered token', () => {
      const token = generateToken('test@example.com', 'customer')
      const tamperedToken = token.slice(0, -5) + 'xxxxx'
      const decoded = verifyToken(tamperedToken)
      expect(decoded).toBeNull()
    })

    it('should return null when JWT_SECRET is not configured', () => {
      // Generate token with secret first
      const token = generateToken('test@example.com')
      
      // Then delete secret and test verifyToken in isolated module
      delete process.env.JWT_SECRET
      jest.isolateModules(() => {
        // Re-import verifyToken - it should return null without secret
        const { verifyToken: verifyTokenNoSecret } = require('../jwt')
        const decoded = verifyTokenNoSecret(token)
        expect(decoded).toBeNull()
      })
    })

    it('should return null for empty string', () => {
      const decoded = verifyToken('')
      expect(decoded).toBeNull()
    })

    it('should preserve username and role in decoded token', () => {
      const username = 'user@example.com'
      const role: UserRole = 'admin'
      const token = generateToken(username, role)
      const decoded = verifyToken(token)

      expect(decoded?.username).toBe(username)
      expect(decoded?.role).toBe(role)
    })
  })

  describe('Token round-trip', () => {
    it('should generate and verify token correctly', () => {
      const username = 'roundtrip@example.com'
      const role: UserRole = 'customer'
      
      const token = generateToken(username, role)
      const decoded = verifyToken(token)

      expect(decoded).not.toBeNull()
      expect(decoded?.username).toBe(username)
      expect(decoded?.role).toBe(role)
    })

    it('should handle multiple tokens independently', () => {
      const token1 = generateToken('user1@example.com', 'customer')
      const token2 = generateToken('user2@example.com', 'admin')

      const decoded1 = verifyToken(token1)
      const decoded2 = verifyToken(token2)

      expect(decoded1?.username).toBe('user1@example.com')
      expect(decoded1?.role).toBe('customer')
      expect(decoded2?.username).toBe('user2@example.com')
      expect(decoded2?.role).toBe('admin')
    })
  })
})
