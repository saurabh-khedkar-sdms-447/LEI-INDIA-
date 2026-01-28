import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createPool } from './db-connection.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pool = createPool()

async function setupDatabase() {
  try {
    console.log('📦 Reading schema file...')
    const schemaPath = join(__dirname, '..', 'prisma', 'schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')

    console.log('🔧 Setting up database tables...')
    await pool.query(schemaSQL)

    console.log('✅ Database setup completed successfully!')
    console.log('📊 Tables created: User, Admin, Category, Product, Order, OrderItem, Inquiry, ContactInfo, Blog, Career, Resource, PasswordResetToken')
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    throw error
  }
}

setupDatabase()
  .catch((e) => {
    console.error('Failed to setup database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
