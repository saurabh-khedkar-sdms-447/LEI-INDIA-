import { createPool } from './db-connection.mjs'

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

    console.log('✅ Career table migration completed successfully')
  } catch (error) {
    console.error('❌ Error migrating Career table:', error)
    throw error
  } finally {
    await pool.end()
  }
}

migrateCareerTable()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
