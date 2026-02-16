import { pool } from '@/src/initDatabase'

export const pgPool = pool

/**
 * Execute a query with retry logic for connection errors
 * Retries up to 3 times with exponential backoff for connection pool exhaustion
 */
export async function queryWithRetry<T extends Record<string, any> = Record<string, any>>(
  queryText: string,
  values?: any[],
  operationName: string = 'query',
  maxRetries: number = 3,
): Promise<{ rows: T[]; rowCount: number }> {
  let lastError: any
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await pool.query<T>(queryText, values)
      return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0,
      }
    } catch (error: any) {
      lastError = error
      // Check if it's a connection pool exhaustion error (code 53300)
      if (error?.code === '53300' && attempt < maxRetries - 1) {
        // Exponential backoff: wait longer for connection exhaustion
        // 200ms, 500ms, 1000ms to give database time to free connections
        const delay = Math.min(200 * Math.pow(2.5, attempt), 2000)
        console.warn(`[DB Pool] Connection exhausted for ${operationName}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
        console.warn(`[DB Pool] Stats: Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      // For other errors or final attempt, throw immediately
      throw error
    }
  }
  throw lastError
}

/**
 * Get a client from the pool with automatic release wrapper
 * Use this for transactions that need explicit client management
 * 
 * @example
 * const client = await getClientWithRetry()
 * try {
 *   await client.query('BEGIN')
 *   // ... queries
 *   await client.query('COMMIT')
 * } catch (e) {
 *   await client.query('ROLLBACK')
 *   throw e
 * } finally {
 *   client.release()
 * }
 */
export async function getClientWithRetry(
  operationName: string = 'get client',
  maxRetries: number = 3,
) {
  let lastError: any
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await pool.connect()
    } catch (error: any) {
      lastError = error
      // If connection pool is exhausted, retry with backoff
      if (error?.code === '53300' && attempt < maxRetries - 1) {
        const delay = Math.min(200 * Math.pow(2.5, attempt), 2000)
        console.warn(`[DB Pool] Connection exhausted for ${operationName}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
        console.warn(`[DB Pool] Stats: Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      // For other errors or final attempt, throw immediately
      if (error?.code === '53300') {
        console.error(`[DB Pool] Connection exhausted for ${operationName} after ${maxRetries} attempts`)
        console.error(`[DB Pool] Final Stats: Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`)
      }
      throw error
    }
  }
  throw lastError
}
