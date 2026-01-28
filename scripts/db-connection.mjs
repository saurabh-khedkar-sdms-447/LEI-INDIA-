import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

/**
 * Creates a PostgreSQL connection pool that handles both Unix sockets and TCP/IP
 */
export function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set')
  }

  const dbUrl = process.env.DATABASE_URL
  
  // Check if this is a Unix socket connection format: postgresql://user@/database
  // This format has no hostname between @ and /
  if (dbUrl.match(/^postgresql:\/\/[^@]+@\/[^\/]+/)) {
    // Extract user and database from Unix socket format
    const match = dbUrl.match(/^postgresql:\/\/([^@]+)@\/(.+)$/)
    if (match) {
      const [, user, database] = match
      // Use Unix socket connection (pg library will use default socket path)
      // Explicitly set password to undefined to avoid password auth
      return new Pool({
        user: user || process.env.USER,
        database: database,
        password: undefined,
      })
    }
  }
  
  // Try to parse as regular URL for TCP/IP connection
  try {
    const url = new URL(dbUrl)
    // If hostname is localhost and no port, might still be Unix socket attempt
    if (url.hostname === 'localhost' && !url.port && url.pathname) {
      return new Pool({
        user: url.username || process.env.USER,
        database: url.pathname.slice(1),
      })
    }
  } catch (e) {
    // If URL parsing fails, try to extract components manually
    const match = dbUrl.match(/^postgresql:\/\/(?:([^:]+):([^@]+)@)?([^\/]+)\/(.+)$/)
    if (match) {
      const [, user, password, host, database] = match
      return new Pool({
        user,
        password,
        host,
        database,
      })
    }
    throw new Error(`Invalid DATABASE_URL format: ${dbUrl}`)
  }
  
  // Use TCP/IP connection with connection string
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}
