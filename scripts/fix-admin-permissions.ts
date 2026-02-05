#!/usr/bin/env tsx
/**
 * Script to fix Admin table permissions
 * This script grants necessary permissions to the database user from DATABASE_URL
 * 
 * Usage: 
 *   tsx scripts/fix-admin-permissions.ts
 * 
 * This script will:
 *   1. Extract the database user from DATABASE_URL
 *   2. Connect as a superuser (or try with current user)
 *   3. Grant all necessary permissions on the Admin table and all other tables
 */

import 'dotenv/config'
import { Pool } from 'pg'

function parseDatabaseUrl(url: string): { user?: string; password?: string; host?: string; port?: number; database: string } | null {
  try {
    const parsed = new URL(url)
    return {
      user: parsed.username || undefined,
      password: parsed.password || undefined,
      host: parsed.hostname || undefined,
      port: parsed.port ? parseInt(parsed.port) : undefined,
      database: parsed.pathname.slice(1) || 'postgres',
    }
  } catch (e) {
    // Try regex parsing for postgresql:// format
    const match = url.match(/^postgresql:\/\/(?:([^:]+):([^@]+)@)?([^\/:]+)(?::(\d+))?\/(.+)$/)
    if (match) {
      const [, user, password, host, port, database] = match
      return {
        user: user || undefined,
        password: password || undefined,
        host: host || undefined,
        port: port ? parseInt(port) : undefined,
        database: database,
      }
    }
    return null
  }
}

async function fixAdminPermissions() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is required')
    process.exit(1)
  }

  const dbInfo = parseDatabaseUrl(DATABASE_URL)
  if (!dbInfo) {
    console.error(`❌ Invalid DATABASE_URL format: ${DATABASE_URL}`)
    process.exit(1)
  }

  if (!dbInfo.user) {
    console.error('❌ Could not determine database user from DATABASE_URL')
    process.exit(1)
  }

  const dbUser = dbInfo.user
  const dbName = dbInfo.database
  const dbHost = dbInfo.host || 'localhost'
  const dbPort = dbInfo.port || 5432

  console.log('🔧 Fixing database permissions...')
  console.log(`   Database: ${dbName}`)
  console.log(`   User: ${dbUser}`)
  console.log(`   Host: ${dbHost}:${dbPort}`)
  console.log('')

  // First, try to connect as the application user to check current permissions
  const appPool = new Pool({
    user: dbUser,
    password: dbInfo.password,
    host: dbHost,
    port: dbPort,
    database: dbName,
  })

  try {
    // Get the current user
    const userResult = await appPool.query('SELECT current_user, session_user')
    const currentUser = userResult.rows[0].current_user
    console.log(`   Current user: ${currentUser}`)

    // Try to grant permissions as the current user (might fail if not owner/superuser)
    try {
      console.log('   Attempting to grant permissions...')

      // Grant permissions on all existing tables
      await appPool.query(`
        DO $$
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO %I', r.tablename, $1);
            EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO PUBLIC', r.tablename);
          END LOOP;
        END $$;
      `, [currentUser])

      // Grant permissions on all sequences
      await appPool.query(`
        DO $$
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
            EXECUTE format('GRANT ALL PRIVILEGES ON SEQUENCE %I TO %I', r.sequence_name, $1);
            EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %I TO PUBLIC', r.sequence_name);
          END LOOP;
        END $$;
      `, [currentUser])

      // Set default privileges for future objects
      await appPool.query(`
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${currentUser};
      `)
      
      await appPool.query(`
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${currentUser};
      `)

      // Grant schema usage
      await appPool.query(`
        GRANT USAGE ON SCHEMA public TO ${currentUser};
        GRANT USAGE ON SCHEMA public TO PUBLIC;
      `)

      // Explicitly grant on Admin table (the one causing the error)
      await appPool.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Admin" TO ${currentUser};
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Admin" TO PUBLIC;
      `)

      console.log('✅ Permissions granted successfully!')
      console.log('')
      console.log('   The Admin table and all other tables now have proper permissions.')
      console.log('   You can now try logging in again.')
    } catch (error: any) {
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.error('❌ Permission denied. The current user cannot grant permissions.')
        console.log('')
        console.log('   You need to run this as a PostgreSQL superuser.')
        console.log('')
        console.log('   Option 1: Run the SQL commands manually as postgres user:')
        console.log('')
        console.log(`   psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \\"${currentUser}\\";"`)
        console.log(`   psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \\"${currentUser}\\";"`)
        console.log(`   psql -U postgres -d ${dbName} -c "GRANT USAGE ON SCHEMA public TO \\"${currentUser}\\";"`)
        console.log(`   psql -U postgres -d ${dbName} -c "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE \\"Admin\\" TO \\"${currentUser}\\";"`)
        console.log('')
        console.log('   Option 2: Use the grant-permissions.sql file:')
        console.log('')
        console.log(`   psql -U postgres -d ${dbName} -f prisma/grant-permissions.sql`)
        console.log('')
        console.log('   Option 3: Connect as postgres and run:')
        console.log('')
        console.log(`   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${currentUser}";`)
        console.log(`   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${currentUser}";`)
        console.log(`   GRANT USAGE ON SCHEMA public TO "${currentUser}";`)
        console.log(`   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Admin" TO "${currentUser}";`)
        process.exit(1)
      } else {
        throw error
      }
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    await appPool.end()
  }
}

fixAdminPermissions()
