import { createPool } from './db-connection.mjs'

const pool = createPool()

async function testDatabase() {
  try {
    console.log('🧪 Testing database connection and data...\n')

    // Test connection
    const connectionTest = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Database connection successful')
    console.log(`   Current time: ${connectionTest.rows[0].current_time}\n`)

    // Count records in each table
    const tables = [
      'User',
      'Admin',
      'Category',
      'Product',
      'Order',
      'OrderItem',
      'Inquiry',
      'ContactInfo',
      'Blog',
      'Career',
      'Resource',
    ]

    console.log('📊 Table Record Counts:')
    console.log('─'.repeat(40))

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`)
        const count = result.rows[0].count
        console.log(`  ${table.padEnd(20)} ${count.toString().padStart(5)} records`)
      } catch (error) {
        console.log(`  ${table.padEnd(20)} ERROR: ${error.message}`)
      }
    }

    console.log('─'.repeat(40))
    console.log()

    // Sample data from key tables
    console.log('📋 Sample Data:')
    console.log('─'.repeat(40))

    // Sample Users
    const users = await pool.query('SELECT name, email, role, "isActive" FROM "User" LIMIT 3')
    console.log('\n👥 Users:')
    users.rows.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`)
    })

    // Sample Admins
    const admins = await pool.query('SELECT username, role, "isActive" FROM "Admin" LIMIT 3')
    console.log('\n👤 Admins:')
    admins.rows.forEach((admin) => {
      console.log(`  - ${admin.username} - ${admin.role} - Active: ${admin.isActive}`)
    })

    // Sample Products
    const products = await pool.query('SELECT sku, name, category, price, "inStock" FROM "Product" LIMIT 5')
    console.log('\n📦 Products:')
    products.rows.forEach((product) => {
      console.log(`  - ${product.sku}: ${product.name} (${product.category}) - ₹${product.price} - In Stock: ${product.inStock}`)
    })

    // Sample Categories
    const categories = await pool.query('SELECT name, slug FROM "Category" LIMIT 5')
    console.log('\n📁 Categories:')
    categories.rows.forEach((category) => {
      console.log(`  - ${category.name} (${category.slug})`)
    })

    // Sample Orders
    const orders = await pool.query('SELECT "companyName", status, "createdAt" FROM "Order" LIMIT 3')
    console.log('\n🛒 Orders:')
    orders.rows.forEach((order) => {
      console.log(`  - ${order.companyName} - Status: ${order.status} - Created: ${order.createdAt}`)
    })

    // Sample Inquiries
    const inquiries = await pool.query('SELECT name, subject, read, responded FROM "Inquiry" LIMIT 3')
    console.log('\n📧 Inquiries:')
    inquiries.rows.forEach((inquiry) => {
      console.log(`  - ${inquiry.name}: ${inquiry.subject} - Read: ${inquiry.read}, Responded: ${inquiry.responded}`)
    })

    console.log('\n─'.repeat(40))
    console.log('✅ Database test completed successfully!')
  } catch (error) {
    console.error('❌ Error testing database:', error.message)
    throw error
  }
}

testDatabase()
  .catch((e) => {
    console.error('Failed to test database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
