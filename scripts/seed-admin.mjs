import bcrypt from 'bcryptjs'
import { createPool } from './db-connection.mjs'

const pool = createPool()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  await pool.query(
    `
    INSERT INTO "Admin" (username, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT (username) DO NOTHING
    `,
    ['admin', passwordHash, 'admin'],
  )

  console.log('✅ Admin user ready: username=admin, password=Admin@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })

