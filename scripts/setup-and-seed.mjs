import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'
import { createPool } from './db-connection.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pool = createPool()

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('\nPlease create a .env file with:')
  console.error('DATABASE_URL=postgresql://username:password@localhost:5432/leiindias')
  console.error('\nCommon formats:')
  console.error('  - postgresql://postgres:password@localhost:5432/leiindias')
  console.error('  - postgresql://postgres@localhost:5432/leiindias (no password)')
  console.error('\nTo create the database:')
  console.error('  sudo -u postgres psql -c "CREATE DATABASE leiindias;"')
  console.error('  OR')
  console.error('  createdb leiindias (if your user has permissions)')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function setupAndSeed() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Starting database setup and seeding...\n')

    // Test connection
    console.log('1️⃣ Testing database connection...')
    await client.query('SELECT NOW()')
    console.log('   ✅ Connection successful\n')

    // Read and execute schema
    console.log('2️⃣ Setting up database schema...')
    const schemaPath = join(__dirname, '..', 'prisma', 'schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')
    await client.query(schemaSQL)
    console.log('   ✅ Schema created successfully\n')

    // Seed data (simplified version - full version in seed-data.mjs)
    console.log('3️⃣ Seeding dummy data...')
    await client.query('BEGIN')

    // Admin users
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10)
    await client.query(
      `INSERT INTO "Admin" (username, password, role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (username) DO NOTHING`,
      ['admin', adminPasswordHash, 'admin', true]
    )

    // Regular users
    const userPasswordHash = await bcrypt.hash('User@123', 10)
    await client.query(
      `INSERT INTO "User" (name, email, password, company, phone, role, "isActive", "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['John Doe', 'john.doe@example.com', userPasswordHash, 'Tech Corp', '+91-9876543210', 'customer', true, true]
    )

    // Categories
    await client.query(
      `INSERT INTO "Category" (name, slug, description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (slug) DO NOTHING`,
      ['Connectors', 'connectors', 'Electrical connectors and terminals']
    )

    // Products
    await client.query(
      `INSERT INTO "Product" (sku, name, category, description, price, "priceType", "inStock", "stockQuantity", images, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW(), NOW())
       ON CONFLICT (sku) DO NOTHING`,
      ['CONN-001', 'RJ45 Ethernet Connector', 'connectors', 'Standard RJ45 connector', 25.50, 'per_unit', true, 500, '[]']
    )

    await client.query('COMMIT')
    console.log('   ✅ Dummy data seeded successfully\n')

    // Verify
    console.log('4️⃣ Verifying setup...')
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM "Admin"'),
      client.query('SELECT COUNT(*) as count FROM "User"'),
      client.query('SELECT COUNT(*) as count FROM "Category"'),
      client.query('SELECT COUNT(*) as count FROM "Product"'),
    ])

    console.log('   📊 Record counts:')
    console.log(`      Admins: ${counts[0].rows[0].count}`)
    console.log(`      Users: ${counts[1].rows[0].count}`)
    console.log(`      Categories: ${counts[2].rows[0].count}`)
    console.log(`      Products: ${counts[3].rows[0].count}`)

    console.log('\n✅ Database setup and seeding completed successfully!')
    console.log('\n🔑 Test credentials:')
    console.log('   Admin: username=admin, password=Admin@123')
    console.log('   User: email=john.doe@example.com, password=User@123')
    console.log('\n💡 For full dummy data, run: pnpm db:seed')

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('\n❌ Error:', error.message)
    if (error.message.includes('does not exist')) {
      console.error('\n💡 The database might not exist. Create it first:')
      console.error('   sudo -u postgres psql -c "CREATE DATABASE leiindias;"')
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Check your DATABASE_URL credentials')
    } else if (error.message.includes('connection')) {
      console.error('\n💡 Check if PostgreSQL is running: pg_isready')
    }
    throw error
  } finally {
    client.release()
  }
}

setupAndSeed()
  .catch((e) => {
    console.error('\nFailed to setup database:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
