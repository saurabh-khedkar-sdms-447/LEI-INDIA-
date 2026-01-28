// Mock pg module before any imports
const mockPoolInstance = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
}

const mockPool = jest.fn(() => mockPoolInstance)

jest.mock('pg', () => ({
  Pool: mockPool,
}))

describe('PostgreSQL Pool', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockPool.mockClear()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Pool initialization', () => {
    it('should initialize pool with DATABASE_URL', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      jest.isolateModules(() => {
        const { pgPool } = require('../pg')
        expect(pgPool).toBeDefined()
        expect(mockPool).toHaveBeenCalledWith(
          expect.objectContaining({
            connectionString: 'postgresql://user:pass@localhost:5432/testdb',
          })
        )
      })
    })

    it('should throw error when DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL
      jest.isolateModules(() => {
        expect(() => {
          require('../pg')
        }).toThrow('DATABASE_URL must be set for Postgres connections')
      })
    })

    it('should configure SSL for production', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.NODE_ENV = 'production'
      jest.isolateModules(() => {
        require('../pg')
        expect(mockPool).toHaveBeenCalledWith(
          expect.objectContaining({
            connectionString: 'postgresql://user:pass@localhost:5432/testdb',
            ssl: { rejectUnauthorized: false },
          })
        )
      })
    })

    it('should not configure SSL for non-production', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
      process.env.NODE_ENV = 'development'
      jest.isolateModules(() => {
        require('../pg')
        expect(mockPool).toHaveBeenCalledWith(
          expect.objectContaining({
            connectionString: 'postgresql://user:pass@localhost:5432/testdb',
            ssl: undefined,
          })
        )
      })
    })
  })

  describe('Pool instance', () => {
    it('should export pgPool instance', () => {
      const { pgPool } = require('../pg')
      expect(pgPool).toBeDefined()
      expect(pgPool).toBe(mockPoolInstance)
    })
  })
})
