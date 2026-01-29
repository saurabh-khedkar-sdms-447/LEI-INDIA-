import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
import dotenv from 'dotenv'
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

async function migrateHeroSlides() {
  const client = await pool.connect()
  try {
    console.log('Creating HeroSlide table...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "HeroSlide" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        image TEXT NOT NULL,
        "ctaText" TEXT,
        "ctaLink" TEXT,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hero_slide_active ON "HeroSlide"(active);
      CREATE INDEX IF NOT EXISTS idx_hero_slide_display_order ON "HeroSlide"("displayOrder");
    `)

    console.log('HeroSlide table created successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrateHeroSlides()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
