import bcrypt from 'bcryptjs'
import { createPool } from './db-connection.mjs'

const pool = createPool()

async function seedData() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    console.log('🌱 Seeding database with dummy data...')

    // 1. Seed Admin Users
    console.log('👤 Creating admin users...')
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10)
    await client.query(
      `INSERT INTO "Admin" (username, password, role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (username) DO NOTHING`,
      ['admin', adminPasswordHash, 'admin', true]
    )
    await client.query(
      `INSERT INTO "Admin" (username, password, role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (username) DO NOTHING`,
      ['superadmin', adminPasswordHash, 'superadmin', true]
    )

    // 2. Seed Regular Users
    console.log('👥 Creating regular users...')
    const userPasswordHash = await bcrypt.hash('User@123', 10)
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Tech Corp',
        phone: '+91-9876543210',
        role: 'customer',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        company: 'Industrial Solutions',
        phone: '+91-9876543211',
        role: 'customer',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        company: 'Manufacturing Inc',
        phone: '+91-9876543212',
        role: 'customer',
      },
    ]

    for (const user of users) {
      await client.query(
        `INSERT INTO "User" (name, email, password, company, phone, role, "isActive", "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, userPasswordHash, user.company, user.phone, user.role, true, true]
      )
    }

    // 3. Seed Categories
    console.log('📁 Creating categories...')
    const categories = [
      {
        name: 'Connectors',
        slug: 'connectors',
        description: 'Electrical connectors and terminals',
        image: '/images/categories/connectors.jpg',
      },
      {
        name: 'Cables',
        slug: 'cables',
        description: 'Various types of cables and wires',
        image: '/images/categories/cables.jpg',
      },
      {
        name: 'Terminals',
        slug: 'terminals',
        description: 'Terminal blocks and connectors',
        image: '/images/categories/terminals.jpg',
      },
      {
        name: 'Switches',
        slug: 'switches',
        description: 'Electrical switches and controls',
        image: '/images/categories/switches.jpg',
        parentId: null,
      },
    ]

    const categoryIds = {}
    for (const category of categories) {
      const result = await client.query(
        `INSERT INTO "Category" (name, slug, description, image, "parentId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
         RETURNING id`,
        [category.name, category.slug, category.description, category.image, category.parentId]
      )
      if (result.rows.length > 0) {
        categoryIds[category.slug] = result.rows[0].id
      }
    }

    // 4. Seed Products
    console.log('📦 Creating products...')
    const products = [
      {
        sku: 'CONN-001',
        name: 'RJ45 Ethernet Connector',
        category: 'connectors',
        description: 'Standard RJ45 connector for Ethernet cables',
        technicalDescription: '8-pin modular connector, gold plated contacts',
        coding: 'T568B',
        pins: 8,
        ipRating: 'IP20',
        gender: 'Male',
        connectorType: 'RJ45',
        material: 'Plastic',
        voltage: '125V',
        current: '1.5A',
        temperatureRange: '-40°C to 85°C',
        wireGauge: '24-26 AWG',
        cableLength: null,
        price: 25.50,
        priceType: 'per_unit',
        inStock: true,
        stockQuantity: 500,
        images: JSON.stringify(['/images/products/conn-001-1.jpg', '/images/products/conn-001-2.jpg']),
        datasheetUrl: '/documents/datasheets/conn-001.pdf',
      },
      {
        sku: 'CONN-002',
        name: 'USB Type-C Connector',
        category: 'connectors',
        description: 'USB Type-C reversible connector',
        technicalDescription: '24-pin USB-C connector, supports USB 3.1',
        coding: null,
        pins: 24,
        ipRating: 'IP54',
        gender: 'Male',
        connectorType: 'USB-C',
        material: 'Metal/Plastic',
        voltage: '5V',
        current: '3A',
        temperatureRange: '-20°C to 70°C',
        wireGauge: '28-30 AWG',
        cableLength: null,
        price: 45.00,
        priceType: 'per_unit',
        inStock: true,
        stockQuantity: 300,
        images: JSON.stringify(['/images/products/conn-002-1.jpg']),
        datasheetUrl: '/documents/datasheets/conn-002.pdf',
      },
      {
        sku: 'CABLE-001',
        name: 'Ethernet Cat6 Cable',
        category: 'cables',
        description: 'Cat6 Ethernet cable, 1 meter',
        technicalDescription: 'Unshielded twisted pair, 23 AWG',
        coding: null,
        pins: null,
        ipRating: null,
        gender: null,
        connectorType: null,
        material: 'Copper',
        voltage: null,
        current: null,
        temperatureRange: '-20°C to 60°C',
        wireGauge: '23 AWG',
        cableLength: '1m',
        price: 150.00,
        priceType: 'per_unit',
        inStock: true,
        stockQuantity: 200,
        images: JSON.stringify(['/images/products/cable-001-1.jpg']),
        datasheetUrl: null,
      },
      {
        sku: 'TERM-001',
        name: 'Terminal Block 10A',
        category: 'terminals',
        description: 'Screw terminal block, 10A rating',
        technicalDescription: '2-position terminal block, screw type',
        coding: null,
        pins: 2,
        ipRating: 'IP20',
        gender: null,
        connectorType: 'Screw Terminal',
        material: 'Plastic/Metal',
        voltage: '300V',
        current: '10A',
        temperatureRange: '-40°C to 105°C',
        wireGauge: '12-24 AWG',
        cableLength: null,
        price: 35.75,
        priceType: 'per_unit',
        inStock: true,
        stockQuantity: 400,
        images: JSON.stringify(['/images/products/term-001-1.jpg', '/images/products/term-001-2.jpg']),
        datasheetUrl: '/documents/datasheets/term-001.pdf',
      },
      {
        sku: 'SWITCH-001',
        name: 'Toggle Switch SPST',
        category: 'switches',
        description: 'Single pole single throw toggle switch',
        technicalDescription: 'SPST toggle switch, 16A rating',
        coding: null,
        pins: 2,
        ipRating: 'IP65',
        gender: null,
        connectorType: 'Solder Lug',
        material: 'Metal/Plastic',
        voltage: '250V AC',
        current: '16A',
        temperatureRange: '-25°C to 85°C',
        wireGauge: '14-18 AWG',
        cableLength: null,
        price: 120.00,
        priceType: 'per_unit',
        inStock: true,
        stockQuantity: 150,
        images: JSON.stringify(['/images/products/switch-001-1.jpg']),
        datasheetUrl: '/documents/datasheets/switch-001.pdf',
      },
    ]

    const productIds = {}
    for (const product of products) {
      const result = await client.query(
        `INSERT INTO "Product" (sku, name, category, description, "technicalDescription", coding, pins, "ipRating", gender, "connectorType", material, voltage, current, "temperatureRange", "wireGauge", "cableLength", price, "priceType", "inStock", "stockQuantity", images, "datasheetUrl", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21::jsonb, $22, NOW(), NOW())
         ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price
         RETURNING id`,
        [
          product.sku,
          product.name,
          product.category,
          product.description,
          product.technicalDescription,
          product.coding,
          product.pins,
          product.ipRating,
          product.gender,
          product.connectorType,
          product.material,
          product.voltage,
          product.current,
          product.temperatureRange,
          product.wireGauge,
          product.cableLength,
          product.price,
          product.priceType,
          product.inStock,
          product.stockQuantity,
          product.images,
          product.datasheetUrl,
        ]
      )
      if (result.rows.length > 0) {
        productIds[product.sku] = result.rows[0].id
      }
    }

    // 5. Seed Orders
    console.log('🛒 Creating orders...')
    const orders = [
      {
        companyName: 'Tech Corp',
        contactName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543210',
        companyAddress: '123 Tech Street, Bangalore, Karnataka 560001',
        notes: 'Urgent delivery required',
        status: 'pending',
      },
      {
        companyName: 'Industrial Solutions',
        contactName: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+91-9876543211',
        companyAddress: '456 Industrial Avenue, Mumbai, Maharashtra 400001',
        notes: 'Bulk order discount requested',
        status: 'processing',
      },
    ]

    const orderIds = []
    for (const order of orders) {
      const result = await client.query(
        `INSERT INTO "Order" ("companyName", "contactName", email, phone, "companyAddress", notes, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [order.companyName, order.contactName, order.email, order.phone, order.companyAddress, order.notes, order.status]
      )
      if (result.rows.length > 0) {
        orderIds.push(result.rows[0].id)
      }
    }

    // 6. Seed Order Items
    console.log('📋 Creating order items...')
    if (orderIds.length > 0 && Object.keys(productIds).length > 0) {
      const orderItems = [
        {
          orderId: orderIds[0],
          productId: productIds['CONN-001'],
          sku: 'CONN-001',
          name: 'RJ45 Ethernet Connector',
          quantity: 50,
          notes: 'Need by end of week',
        },
        {
          orderId: orderIds[0],
          productId: productIds['CABLE-001'],
          sku: 'CABLE-001',
          name: 'Ethernet Cat6 Cable',
          quantity: 25,
          notes: null,
        },
        {
          orderId: orderIds[1],
          productId: productIds['TERM-001'],
          sku: 'TERM-001',
          name: 'Terminal Block 10A',
          quantity: 100,
          notes: 'Bulk pricing',
        },
      ]

      for (const item of orderItems) {
        await client.query(
          `INSERT INTO "OrderItem" ("orderId", "productId", sku, name, quantity, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [item.orderId, item.productId, item.sku, item.name, item.quantity, item.notes]
        )
      }
    }

    // 7. Seed Inquiries
    console.log('📧 Creating inquiries...')
    const inquiries = [
      {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        phone: '+91-9876543213',
        company: 'Electronics Ltd',
        subject: 'Product Inquiry - USB Connectors',
        message: 'I am interested in bulk purchase of USB Type-C connectors. Please provide pricing for 1000 units.',
        read: false,
        responded: false,
      },
      {
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
        phone: '+91-9876543214',
        company: 'Automation Systems',
        subject: 'Custom Cable Requirements',
        message: 'We need custom length Ethernet cables. Can you provide custom manufacturing?',
        read: true,
        responded: true,
        notes: 'Replied with custom quote',
      },
    ]

    for (const inquiry of inquiries) {
      await client.query(
        `INSERT INTO "Inquiry" (name, email, phone, company, subject, message, read, responded, notes, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          inquiry.name,
          inquiry.email,
          inquiry.phone,
          inquiry.company,
          inquiry.subject,
          inquiry.message,
          inquiry.read,
          inquiry.responded,
          inquiry.notes || null,
        ]
      )
    }

    // 8. Seed Contact Info
    console.log('📞 Creating contact info...')
    await client.query(
      `INSERT INTO "ContactInfo" (email, phone, address, city, state, country, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [
        'info@leiindias.com',
        '+91-80-12345678',
        '123 Business Park, Industrial Area',
        'Bangalore',
        'Karnataka',
        'India',
      ]
    )

    // 9. Seed Blogs
    console.log('📝 Creating blog posts...')
    const blogs = [
      {
        title: 'Understanding Electrical Connectors: A Complete Guide',
        slug: 'understanding-electrical-connectors-guide',
        excerpt: 'Learn about different types of electrical connectors and their applications in modern electronics.',
        content: 'Electrical connectors are essential components in any electronic system...',
        image: '/images/blogs/connectors-guide.jpg',
        published: true,
      },
      {
        title: 'Best Practices for Cable Management',
        slug: 'best-practices-cable-management',
        excerpt: 'Tips and tricks for organizing cables in industrial and commercial settings.',
        content: 'Proper cable management is crucial for maintaining safety and efficiency...',
        image: '/images/blogs/cable-management.jpg',
        published: true,
      },
      {
        title: 'Future of USB-C Technology',
        slug: 'future-usb-c-technology',
        excerpt: 'Exploring the latest developments in USB-C connector technology.',
        content: 'USB-C has revolutionized connectivity in modern devices...',
        image: '/images/blogs/usb-c-future.jpg',
        published: false,
      },
    ]

    for (const blog of blogs) {
      await client.query(
        `INSERT INTO "Blog" (title, slug, excerpt, content, image, published, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [blog.title, blog.slug, blog.excerpt, blog.content, blog.image, blog.published]
      )
    }

    // 10. Seed Careers
    console.log('💼 Creating career listings...')
    const careers = [
      {
        title: 'Senior Electrical Engineer',
        slug: 'senior-electrical-engineer',
        location: 'Bangalore, India',
        type: 'Full-time',
        description: 'We are looking for an experienced electrical engineer to join our product development team.',
        requirements: 'B.Tech in Electrical Engineering, 5+ years experience, knowledge of connector design',
      },
      {
        title: 'Sales Manager',
        slug: 'sales-manager',
        location: 'Mumbai, India',
        type: 'Full-time',
        description: 'Lead our sales team and drive business growth in the industrial sector.',
        requirements: 'MBA preferred, 3+ years B2B sales experience, strong communication skills',
      },
    ]

    for (const career of careers) {
      await client.query(
        `INSERT INTO "Career" (title, slug, location, type, description, requirements, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [career.title, career.slug, career.location, career.type, career.description, career.requirements]
      )
    }

    // 11. Seed Resources
    console.log('📚 Creating resources...')
    const resources = [
      {
        title: 'Product Catalog 2024',
        slug: 'product-catalog-2024',
        description: 'Complete catalog of all our products with specifications and pricing.',
        url: '/documents/catalog-2024.pdf',
      },
      {
        title: 'Installation Guide - Connectors',
        slug: 'installation-guide-connectors',
        description: 'Step-by-step guide for installing various types of connectors.',
        url: '/documents/installation-guide-connectors.pdf',
      },
      {
        title: 'Technical Specifications Sheet',
        slug: 'technical-specifications',
        description: 'Comprehensive technical specifications for all product categories.',
        url: '/documents/technical-specs.pdf',
      },
    ]

    for (const resource of resources) {
      await client.query(
        `INSERT INTO "Resource" (title, slug, description, url, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [resource.title, resource.slug, resource.description, resource.url]
      )
    }

    await client.query('COMMIT')
    console.log('✅ Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log('  - 2 Admin users (admin, superadmin)')
    console.log('  - 3 Regular users')
    console.log('  - 4 Categories')
    console.log('  - 5 Products')
    console.log('  - 2 Orders with items')
    console.log('  - 2 Inquiries')
    console.log('  - 1 Contact info entry')
    console.log('  - 3 Blog posts')
    console.log('  - 2 Career listings')
    console.log('  - 3 Resources')
    console.log('\n🔑 Admin credentials:')
    console.log('  Username: admin')
    console.log('  Password: Admin@123')
    console.log('\n👤 User credentials:')
    console.log('  Email: john.doe@example.com')
    console.log('  Password: User@123')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error seeding database:', error.message)
    throw error
  } finally {
    client.release()
  }
}

seedData()
  .catch((e) => {
    console.error('Failed to seed database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
