#!/usr/bin/env tsx
/**
 * Migration Script: Add drawingUrl column to Product table
 * 
 * This script runs the migration to add the drawingUrl column.
 * It uses DATABASE_URL from environment variables.
 * 
 * Usage:
 *   pnpm tsx scripts/run-drawing-url-migration.ts
 *   OR
 *   tsx scripts/run-drawing-url-migration.ts
 */

import 'dotenv/config'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  console.error('Please set DATABASE_URL in your .env.local file or environment')
  process.exit(1)
}

async function runMigration() {
  const pool = new Pool({ connectionString: DATABASE_URL })
  
  try {
    console.log('🔄 Running migration: Add drawingUrl column to Product table...')
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'prisma', 'migrate-add-drawing-url.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    // Execute the migration
    await pool.query(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    console.log('   The drawingUrl column has been added to the Product table.')
    
  } catch (error: any) {
    if (error?.code === '42701') {
      console.log('ℹ️  Column drawingUrl already exists. Migration may have already been run.')
    } else {
      console.error('❌ Migration failed:', error.message)
      if (error.code) {
        console.error(`   Error code: ${error.code}`)
      }
      process.exit(1)
    }
  } finally {
    await pool.end()
  }
}

runMigration().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
