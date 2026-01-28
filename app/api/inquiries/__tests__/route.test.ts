import { POST, GET } from '../route'
import { createMockRequest, createAuthenticatedRequest } from '@/lib/__tests__/test-utils'
import { pgPool } from '@/lib/pg'

// Mock pg module
jest.mock('@/lib/pg', () => ({
  pgPool: {
    query: jest.fn(),
  },
}))

describe('Inquiries API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/inquiries', () => {
    it('should create an inquiry successfully', async () => {
      const mockInquiry = {
        id: 'inquiry-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Test Company',
        subject: 'Test Subject',
        message: 'This is a test inquiry message',
        read: false,
        responded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [mockInquiry] })

      const body = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Test Company',
        subject: 'Test Subject',
        message: 'This is a test inquiry message',
      }

      const req = createMockRequest(body)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('John Doe')
      expect(data.email).toBe('john@example.com')
      expect(data.read).toBe(false)
      expect(data.responded).toBe(false)
    })

    it('should create inquiry without optional fields', async () => {
      const mockInquiry = {
        id: 'inquiry-2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: null,
        company: null,
        subject: 'Another Subject',
        message: 'Another test message here',
        read: false,
        responded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: [mockInquiry] })

      const body = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Another Subject',
        message: 'Another test message here',
      }

      const req = createMockRequest(body)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.phone).toBeNull()
      expect(data.company).toBeNull()
    })

    it('should return 400 for invalid data', async () => {
      const req = createMockRequest({
        name: 'J', // Too short
        email: 'invalid-email', // Invalid email
        subject: 'AB', // Too short
        message: 'Short', // Too short
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
      expect(Array.isArray(data.details)).toBe(true)
    })

    it('should return 400 on database error', async () => {
      ;(pgPool.query as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test inquiry message',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Failed to submit inquiry')
    })
  })

  describe('GET /api/inquiries', () => {
    it('should return inquiries list for admin', async () => {
      const mockInquiries = [
        {
          id: 'inquiry-1',
          name: 'John Doe',
          email: 'john@example.com',
          read: false,
          responded: false,
        },
        {
          id: 'inquiry-2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          read: true,
          responded: true,
        },
      ]

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: mockInquiries })

      const req = createAuthenticatedRequest(undefined, 'admin', 'admin_token')
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
    })

    it('should return 403 for non-admin users', async () => {
      const req = createAuthenticatedRequest(undefined, 'customer', 'user_token')
      const response = await GET(req)
      expect(response.status).toBe(403)
    })

    it('should return 500 on database error', async () => {
      ;(pgPool.query as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = createAuthenticatedRequest(undefined, 'admin', 'admin_token')
      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch inquiries')
    })
  })
})
