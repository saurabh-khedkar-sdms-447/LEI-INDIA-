import { execSync } from 'child_process'

console.log('🔧 Database Setup Helper\n')

// Try different connection methods
const connectionMethods = [
  {
    name: 'Current user with default database',
    cmd: `psql -d postgres -c "SELECT 1"`,
  },
  {
    name: 'Postgres user',
    cmd: `sudo -u postgres psql -c "SELECT 1"`,
  },
]

let workingMethod = null

for (const method of connectionMethods) {
  try {
    console.log(`Testing: ${method.name}...`)
    execSync(method.cmd, { stdio: 'ignore' })
    workingMethod = method
    console.log(`✅ ${method.name} works!\n`)
    break
  } catch (error) {
    console.log(`❌ ${method.name} failed\n`)
  }
}

if (!workingMethod) {
  console.log('⚠️  Could not establish PostgreSQL connection automatically.')
  console.log('\nPlease set up DATABASE_URL manually:')
  console.log('1. Create database: createdb leiindias (or use psql)')
  console.log('2. Set DATABASE_URL in .env file')
  console.log('3. Run: pnpm db:setup')
  process.exit(1)
}

// Try to create database
console.log('📦 Creating database "leiindias"...')
try {
  if (workingMethod.name.includes('sudo')) {
    execSync(`sudo -u postgres psql -c "CREATE DATABASE leiindias;"`, { stdio: 'inherit' })
  } else {
    execSync(`createdb leiindias`, { stdio: 'inherit' })
  }
  console.log('✅ Database created successfully!\n')
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('ℹ️  Database already exists, continuing...\n')
  } else {
    console.log('⚠️  Could not create database automatically.')
    console.log('You may need to create it manually:')
    console.log('  createdb leiindias')
    console.log('  OR')
    console.log('  sudo -u postgres psql -c "CREATE DATABASE leiindias;"')
    console.log('\nThen set DATABASE_URL in .env and run: pnpm db:setup\n')
    process.exit(1)
  }
}

console.log('✅ Database setup helper completed!')
console.log('\nNext steps:')
console.log('1. Set DATABASE_URL in .env file')
console.log('2. Run: pnpm db:setup')
console.log('3. Run: pnpm db:seed')
console.log('4. Run: pnpm db:test')
