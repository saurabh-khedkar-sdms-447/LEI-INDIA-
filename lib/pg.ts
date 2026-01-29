import { pool } from '@/src/initDatabase'

export const pgPool = pool

export async function queryWithRetry<T extends Record<string, any> = Record<string, any>>(
  queryText: string,
  values?: any[],
  operationName: string = 'query',
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await pool.query<T>(queryText, values)
  return {
    rows: result.rows,
    rowCount: result.rowCount ?? 0,
  }
}

export async function getClientWithRetry(
  operationName: string = 'get client',
) {
  return pool.connect()
}
