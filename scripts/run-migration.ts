#!/usr/bin/env tsx
/**
 * Migration Runner Script
 * 
 * Safely runs database migrations, checking for column existence first.
 * This script ensures the categoryId column exists in the Product table.
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

function createPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required but not set')
  }
  return new Pool({ connectionString: DATABASE_URL })
}

async function checkColumnExists(pool: Pool, tableName: string, columnName: string): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1 
      AND column_name = $2
    )
    `,
    [tableName, columnName]
  )
  return result.rows[0].exists
}

async function runMigration(): Promise<void> {
  const pool = createPool()
  
  try {
    console.log('Checking if categoryId column exists...')
    const columnExists = await checkColumnExists(pool, 'Product', 'categoryId')
    
    if (columnExists) {
      console.log('✅ categoryId column already exists. Migration not needed.')
      return
    }

    console.log('⚠️  categoryId column not found. Running migration...')
    
    const migrationPath = join(process.cwd(), 'prisma', 'migrate-product-category-fk.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    // Execute migration
    await pool.query(migrationSQL)
    
    console.log('✅ Migration completed successfully.')
    
    // Verify the column was created
    const verifyExists = await checkColumnExists(pool, 'Product', 'categoryId')
    if (verifyExists) {
      console.log('✅ Verified: categoryId column now exists.')
    } else {
      console.error('❌ Warning: Migration ran but column still not found.')
      throw new Error('Migration verification failed')
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration script completed.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export { runMigration }
