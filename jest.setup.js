// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing'
process.env.JWT_EXPIRES_IN = '1h'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
process.env.NODE_ENV = 'test'
