import { POST, GET } from '../route'
import { createMockRequest, createAuthenticatedRequest, createMockClient } from '@/lib/__tests__/test-utils'
import { pgPool } from '@/lib/pg'

// Mock pg module
jest.mock('@/lib/pg', () => ({
  pgPool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}))

describe('Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/orders', () => {
    it('should create an order successfully', async () => {
      const mockClient = createMockClient()
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: 'order-1',
            companyName: 'Test Company',
            contactName: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            companyAddress: null,
            notes: null,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        }) // INSERT order
        .mockResolvedValueOnce({
          rows: [{
            id: 'item-1',
            orderId: 'order-1',
            productId: 'prod-1',
            sku: 'SKU-001',
            name: 'Test Product',
            quantity: 2,
            notes: null,
          }],
        }) // INSERT items
        .mockResolvedValueOnce({}) // COMMIT

      ;(pgPool.connect as jest.Mock).mockResolvedValue(mockClient)

      const body = {
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        items: [{
          productId: 'prod-1',
          sku: 'SKU-001',
          name: 'Test Product',
          quantity: 2,
        }],
      }

      const req = createAuthenticatedRequest(body, 'customer')
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.companyName).toBe('Test Company')
      expect(data.items).toHaveLength(1)
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN')
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
      expect(mockClient.release).toHaveBeenCalled()
    })

    it('should return 401 for unauthenticated requests', async () => {
      const req = createMockRequest({
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        items: [],
      })

      const response = await POST(req)
      expect(response.status).toBe(401)
    })

    it('should return 400 for invalid data', async () => {
      const req = createAuthenticatedRequest({
        companyName: '', // Invalid: too short
        contactName: 'J', // Invalid: too short
        email: 'invalid-email', // Invalid email
        phone: '123', // Invalid: too short
        items: [], // Invalid: empty array
      }, 'customer')

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
      expect(Array.isArray(data.details)).toBe(true)
    })

    it('should rollback transaction on error', async () => {
      const mockClient = createMockClient()
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'order-1' }],
        }) // INSERT order
        .mockRejectedValueOnce(new Error('Database error')) // INSERT items fails
        .mockResolvedValueOnce({}) // ROLLBACK

      ;(pgPool.connect as jest.Mock).mockResolvedValue(mockClient)

      const req = createAuthenticatedRequest({
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        items: [{
          productId: 'prod-1',
          sku: 'SKU-001',
          name: 'Test Product',
          quantity: 2,
        }],
      }, 'customer')

      const response = await POST(req)

      expect(response.status).toBe(400)
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('GET /api/orders', () => {
    it('should return orders list for admin', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          companyName: 'Company 1',
          items: [{ id: 'item-1', name: 'Product 1' }],
        },
        {
          id: 'order-2',
          companyName: 'Company 2',
          items: [{ id: 'item-2', name: 'Product 2' }],
        },
      ]

      ;(pgPool.query as jest.Mock).mockResolvedValue({ rows: mockOrders })

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
      expect(data.error).toBe('Failed to fetch orders')
    })
  })
})
