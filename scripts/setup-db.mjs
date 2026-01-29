import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createPool } from './db-connection.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pool = createPool()

async function migrateCareerTable() {
  try {
    console.log('🔄 Migrating Career table...')

    // Check if columns exist and add them if they don't
    const alterQueries = [
      // Add department column if it doesn't exist
      `DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'Career' AND column_name = 'department') THEN
            ALTER TABLE "Career" ADD COLUMN department TEXT;
          END IF;
        END $$;`,
      
      // Add responsibilities column if it doesn't exist
      `DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'Career' AND column_name = 'responsibilities') THEN
            ALTER TABLE "Career" ADD COLUMN responsibilities TEXT;
          END IF;
        END $$;`,
      
      // Add benefits column if it doesn't exist
      `DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'Career' AND column_name = 'benefits') THEN
            ALTER TABLE "Career" ADD COLUMN benefits TEXT;
          END IF;
        END $$;`,
      
      // Add salary column if it doesn't exist
      `DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'Career' AND column_name = 'salary') THEN
            ALTER TABLE "Career" ADD COLUMN salary TEXT;
          END IF;
        END $$;`,
      
      // Add active column if it doesn't exist
      `DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'Career' AND column_name = 'active') THEN
            ALTER TABLE "Career" ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
          END IF;
        END $$;`,
    ]

    for (const query of alterQueries) {
      await pool.query(query)
    }

    console.log('   ✅ Career table migration completed')
  } catch (error) {
    // Migration errors are non-fatal - columns may already exist
    console.log('   ℹ️  Migration check completed (columns may already exist)')
  }
}

async function setupDatabase() {
  try {
    console.log('📦 Reading schema file...')
    const schemaPath = join(__dirname, '..', 'prisma', 'schema.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')

    console.log('🔧 Setting up database tables...')
    await pool.query(schemaSQL)

    // Run migration for Career table to add missing columns
    await migrateCareerTable()

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
