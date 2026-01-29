#!/usr/bin/env node
/**
 * Migration script to add documents field to Product table
 * Run: node scripts/migrate-product-documents.mjs
 */

import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function migrateProductDocuments() {
  const client = await pool.connect()
  try {
    console.log('Starting migration: Add documents field to Product table')

    // Check if documents column already exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Product' AND column_name = 'documents'
    `)

    if (checkResult.rows.length > 0) {
      console.log('Documents column already exists. Skipping migration.')
      return
    }

    // Add documents column
    await client.query(`
      ALTER TABLE "Product" 
      ADD COLUMN documents JSONB NOT NULL DEFAULT '[]'::jsonb
    `)

    console.log('Successfully added documents column to Product table')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrateProductDocuments()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
