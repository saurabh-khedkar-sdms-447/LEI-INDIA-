#!/usr/bin/env node
/**
 * Migration script to add attachments column to CompanyPolicy table
 * This script is idempotent and safe to run multiple times
 */

import 'dotenv/config'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
})

async function runMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Running migration: Add attachments column to CompanyPolicy...')
    
    // Check if column already exists
    const checkResult = await client.query(`
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'CompanyPolicy' 
      AND column_name = 'attachments'
    `)
    
    if (checkResult.rows.length > 0) {
      console.log('✅ attachments column already exists in CompanyPolicy table')
      return
    }
    
    // Add the column
    await client.query(`
      ALTER TABLE "CompanyPolicy" 
      ADD COLUMN attachments JSONB NOT NULL DEFAULT '[]'::jsonb
    `)
    
    console.log('✅ Successfully added attachments column to CompanyPolicy table')
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
  .then(() => {
    console.log('✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
