#!/usr/bin/env tsx
/**
 * Seed Categories and Products Script
 * 
 * Creates the complete category hierarchy from the product classification diagram
 * and seeds dummy products for each category.
 */

import 'dotenv/config'
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

function createPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required but not set')
  }
  return new Pool({ connectionString: DATABASE_URL })
}

interface CategoryData {
  name: string
  slug: string
  description: string
  parentSlug?: string
}

interface ProductData {
  description: string
  categorySlug: string
  mpn?: string
  connectorType?: string
  code?: string
  degreeOfProtection?: string
  cableLength?: string
  wireCrossSection?: string
  cableMantleColor?: string
  cableMantleMaterial?: string
  housingMaterial?: string
  temperatureRange?: string
}

async function seedCategories(pool: Pool): Promise<Map<string, string>> {
  console.log('🌱 Seeding categories...')
  
  const categoryMap = new Map<string, string>() // slug -> id

  // Level 1: Main Categories
  const level1Categories: CategoryData[] = [
    {
      name: 'M8 & M12 Sensor Cable',
      slug: 'm8-m12-sensor-cable',
      description: 'M8 and M12 sensor cables for industrial applications',
    },
    {
      name: 'Field Wireable Connector',
      slug: 'field-wireable-connector',
      description: 'Field wireable connectors for M8 and M12 applications',
    },
    {
      name: 'PROFINET',
      slug: 'profinet',
      description: 'PROFINET cordsets and cables for Industrial Ethernet',
    },
    {
      name: 'Industrial Ethernet',
      slug: 'industrial-ethernet',
      description: 'Industrial Ethernet cables and connectors',
    },
    {
      name: 'Y Splitter',
      slug: 'y-splitter',
      description: 'Y splitter cables for signal distribution',
    },
    {
      name: 'Y Distributor',
      slug: 'y-distributor',
      description: 'Y distributor cables for signal distribution',
    },
    {
      name: 'Cord Set',
      slug: 'cord-set',
      description: 'Pre-assembled cord sets with connectors',
    },
  ]

  // Level 2: Sub-categories
  const level2Categories: CategoryData[] = [
    // M8 & M12 Sensor Cable children
    { name: 'M8 Sensor Cable', slug: 'm8-sensor-cable', description: 'M8 sensor cables', parentSlug: 'm8-m12-sensor-cable' },
    { name: 'M12 Sensor Cable', slug: 'm12-sensor-cable', description: 'M12 sensor cables', parentSlug: 'm8-m12-sensor-cable' },
    // Field Wireable Connector children
    { name: 'M8 Connector', slug: 'm8-connector', description: 'M8 field wireable connectors', parentSlug: 'field-wireable-connector' },
    { name: 'M12 Connector', slug: 'm12-connector', description: 'M12 field wireable connectors', parentSlug: 'field-wireable-connector' },
    // PROFINET children
    { name: 'RJ45-M12', slug: 'rj45-m12', description: 'PROFINET RJ45 to M12 cordsets', parentSlug: 'profinet' },
    { name: 'RJ45-M8', slug: 'rj45-m8', description: 'PROFINET RJ45 to M8 cordsets', parentSlug: 'profinet' },
    // Industrial Ethernet children
    { name: 'RJ45-RJ45', slug: 'rj45-rj45', description: 'Industrial Ethernet RJ45 to RJ45 cables', parentSlug: 'industrial-ethernet' },
    // Y Splitter children
    { name: 'M12-M12', slug: 'y-splitter-m12-m12', description: 'Y splitter M12 to M12', parentSlug: 'y-splitter' },
    { name: 'M12-M8', slug: 'y-splitter-m12-m8', description: 'Y splitter M12 to M8', parentSlug: 'y-splitter' },
    { name: 'M8-M8', slug: 'y-splitter-m8-m8', description: 'Y splitter M8 to M8', parentSlug: 'y-splitter' },
    // Y Distributor children
    { name: 'M12-M12', slug: 'y-distributor-m12-m12', description: 'Y distributor M12 to M12', parentSlug: 'y-distributor' },
    { name: 'M12-M8', slug: 'y-distributor-m12-m8', description: 'Y distributor M12 to M8', parentSlug: 'y-distributor' },
    { name: 'M8-M8', slug: 'y-distributor-m8-m8', description: 'Y distributor M8 to M8', parentSlug: 'y-distributor' },
    // Cord Set children
    { name: 'M12-M12', slug: 'cord-set-m12-m12', description: 'Cord set M12 to M12', parentSlug: 'cord-set' },
    { name: 'M8-M8', slug: 'cord-set-m8-m8', description: 'Cord set M8 to M8', parentSlug: 'cord-set' },
    { name: 'M12-M8', slug: 'cord-set-m12-m8', description: 'Cord set M12 to M8', parentSlug: 'cord-set' },
  ]

  // Level 3: Specific configurations
  const level3Categories: CategoryData[] = [
    // M8 Sensor Cable configurations
    { name: 'Open End', slug: 'm8-sensor-cable-open-end', description: 'M8 sensor cable with open end', parentSlug: 'm8-sensor-cable' },
    { name: 'Cord Set', slug: 'm8-sensor-cable-cord-set', description: 'M8 sensor cable cord set', parentSlug: 'm8-sensor-cable' },
    // M12 Sensor Cable configurations
    { name: 'Open End', slug: 'm12-sensor-cable-open-end', description: 'M12 sensor cable with open end', parentSlug: 'm12-sensor-cable' },
    { name: 'Cord Set', slug: 'm12-sensor-cable-cord-set', description: 'M12 sensor cable cord set', parentSlug: 'm12-sensor-cable' },
    // M8 Connector configurations
    { name: 'Shielded', slug: 'm8-connector-shielded', description: 'M8 shielded connector', parentSlug: 'm8-connector' },
    { name: 'Un-Shielded', slug: 'm8-connector-unshielded', description: 'M8 unshielded connector', parentSlug: 'm8-connector' },
    // M12 Connector configurations
    { name: 'Shielded', slug: 'm12-connector-shielded', description: 'M12 shielded connector', parentSlug: 'm12-connector' },
    { name: 'Un-Shielded', slug: 'm12-connector-unshielded', description: 'M12 unshielded connector', parentSlug: 'm12-connector' },
  ]

  // Insert Level 1 categories
  for (const cat of level1Categories) {
    const result = await pool.query(
      `INSERT INTO "Category" (name, slug, description, "parentId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NULL, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         "updatedAt" = NOW()
       RETURNING id`,
      [cat.name, cat.slug, cat.description]
    )
    if (result.rows.length > 0) {
      categoryMap.set(cat.slug, result.rows[0].id)
      console.log(`  ✓ Created category: ${cat.name}`)
    }
  }

  // Insert Level 2 categories
  for (const cat of level2Categories) {
    const parentId = cat.parentSlug ? categoryMap.get(cat.parentSlug) : null
    if (!parentId) {
      console.error(`  ✗ Parent not found for: ${cat.name} (parent: ${cat.parentSlug})`)
      continue
    }

    const result = await pool.query(
      `INSERT INTO "Category" (name, slug, description, "parentId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         "parentId" = EXCLUDED."parentId",
         "updatedAt" = NOW()
       RETURNING id`,
      [cat.name, cat.slug, cat.description, parentId]
    )
    if (result.rows.length > 0) {
      categoryMap.set(cat.slug, result.rows[0].id)
      console.log(`  ✓ Created category: ${cat.name}`)
    }
  }

  // Insert Level 3 categories
  for (const cat of level3Categories) {
    const parentId = cat.parentSlug ? categoryMap.get(cat.parentSlug) : null
    if (!parentId) {
      console.error(`  ✗ Parent not found for: ${cat.name} (parent: ${cat.parentSlug})`)
      continue
    }

    const result = await pool.query(
      `INSERT INTO "Category" (name, slug, description, "parentId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         "parentId" = EXCLUDED."parentId",
         "updatedAt" = NOW()
       RETURNING id`,
      [cat.name, cat.slug, cat.description, parentId]
    )
    if (result.rows.length > 0) {
      categoryMap.set(cat.slug, result.rows[0].id)
      console.log(`  ✓ Created category: ${cat.name}`)
    }
  }

  console.log(`✅ Created ${categoryMap.size} categories\n`)
  return categoryMap
}

async function generateSKU(categorySlug: string, index: number): Promise<string> {
  const prefix = categorySlug
    .split('-')
    .map((word) => word.substring(0, 3).toUpperCase())
    .join('-')
  return `${prefix}-${String(index + 1).padStart(3, '0')}`
}

async function seedProducts(pool: Pool, categoryMap: Map<string, string>): Promise<void> {
  console.log('🌱 Seeding products...')

  // Define products for each leaf category (level 3) and level 2 categories without level 3
  const productsByCategory: Record<string, ProductData[]> = {
    // Level 3 categories
    'm8-sensor-cable-open-end': [
      { description: 'M8 Sensor Cable Open End - 2m - IP67', categorySlug: 'm8-sensor-cable-open-end', mpn: 'M8-SC-OE-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M8 Sensor Cable Open End - 5m - IP67', categorySlug: 'm8-sensor-cable-open-end', mpn: 'M8-SC-OE-002', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M8 Sensor Cable Open End - 10m - IP67', categorySlug: 'm8-sensor-cable-open-end', mpn: 'M8-SC-OE-003', connectorType: 'M8', code: 'B', degreeOfProtection: 'IP67', cableLength: '10m', wireCrossSection: '0.34 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'm8-sensor-cable-cord-set': [
      { description: 'M8 Sensor Cable Cord Set - 2m - IP67', categorySlug: 'm8-sensor-cable-cord-set', mpn: 'M8-SC-CS-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M8 Sensor Cable Cord Set - 5m - IP67', categorySlug: 'm8-sensor-cable-cord-set', mpn: 'M8-SC-CS-002', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'm12-sensor-cable-open-end': [
      { description: 'M12 Sensor Cable Open End - 2m - IP67', categorySlug: 'm12-sensor-cable-open-end', mpn: 'M12-SC-OE-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M12 Sensor Cable Open End - 5m - IP67', categorySlug: 'm12-sensor-cable-open-end', mpn: 'M12-SC-OE-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M12 Sensor Cable Open End - 10m - IP67', categorySlug: 'm12-sensor-cable-open-end', mpn: 'M12-SC-OE-003', connectorType: 'M12', code: 'B', degreeOfProtection: 'IP67', cableLength: '10m', wireCrossSection: '0.34 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'm12-sensor-cable-cord-set': [
      { description: 'M12 Sensor Cable Cord Set - 2m - IP67', categorySlug: 'm12-sensor-cable-cord-set', mpn: 'M12-SC-CS-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M12 Sensor Cable Cord Set - 5m - IP67', categorySlug: 'm12-sensor-cable-cord-set', mpn: 'M12-SC-CS-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'm8-connector-shielded': [
      { description: 'M8 Shielded Connector - 4 Pin - IP67', categorySlug: 'm8-connector-shielded', mpn: 'M8-CON-SH-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', housingMaterial: 'Metal', temperatureRange: '-25°C to +85°C' },
      { description: 'M8 Shielded Connector - 5 Pin - IP67', categorySlug: 'm8-connector-shielded', mpn: 'M8-CON-SH-002', connectorType: 'M8', code: 'B', degreeOfProtection: 'IP67', housingMaterial: 'Metal', temperatureRange: '-25°C to +85°C' },
    ],
    'm8-connector-unshielded': [
      { description: 'M8 Un-Shielded Connector - 4 Pin - IP67', categorySlug: 'm8-connector-unshielded', mpn: 'M8-CON-US-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M8 Un-Shielded Connector - 5 Pin - IP67', categorySlug: 'm8-connector-unshielded', mpn: 'M8-CON-US-002', connectorType: 'M8', code: 'B', degreeOfProtection: 'IP67', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'm12-connector-shielded': [
      { description: 'M12 Shielded Connector - 4 Pin - IP67', categorySlug: 'm12-connector-shielded', mpn: 'M12-CON-SH-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', housingMaterial: 'Metal', temperatureRange: '-25°C to +85°C' },
      { description: 'M12 Shielded Connector - 5 Pin - IP67', categorySlug: 'm12-connector-shielded', mpn: 'M12-CON-SH-002', connectorType: 'M12', code: 'B', degreeOfProtection: 'IP67', housingMaterial: 'Metal', temperatureRange: '-25°C to +85°C' },
      { description: 'M12 Shielded Connector - 8 Pin - IP67', categorySlug: 'm12-connector-shielded', mpn: 'M12-CON-SH-003', connectorType: 'M12', code: 'D', degreeOfProtection: 'IP67', housingMaterial: 'Metal', temperatureRange: '-25°C to +85°C' },
    ],
    'm12-connector-unshielded': [
      { description: 'M12 Un-Shielded Connector - 4 Pin - IP67', categorySlug: 'm12-connector-unshielded', mpn: 'M12-CON-US-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'M12 Un-Shielded Connector - 5 Pin - IP67', categorySlug: 'm12-connector-unshielded', mpn: 'M12-CON-US-002', connectorType: 'M12', code: 'B', degreeOfProtection: 'IP67', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    // Level 2 categories without level 3
    'rj45-m12': [
      { description: 'PROFINET RJ45-M12 Cordset - 2m - IP67', categorySlug: 'rj45-m12', mpn: 'PN-RJ45-M12-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'PROFINET RJ45-M12 Cordset - 5m - IP67', categorySlug: 'rj45-m12', mpn: 'PN-RJ45-M12-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'PROFINET RJ45-M12 Cordset - 10m - IP67', categorySlug: 'rj45-m12', mpn: 'PN-RJ45-M12-003', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '10m', wireCrossSection: '0.34 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'rj45-m8': [
      { description: 'PROFINET RJ45-M8 Cordset - 2m - IP67', categorySlug: 'rj45-m8', mpn: 'PN-RJ45-M8-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'PROFINET RJ45-M8 Cordset - 5m - IP67', categorySlug: 'rj45-m8', mpn: 'PN-RJ45-M8-002', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'rj45-rj45': [
      { description: 'Industrial Ethernet RJ45-RJ45 Cable - 2m - IP20', categorySlug: 'rj45-rj45', mpn: 'IE-RJ45-RJ45-001', connectorType: 'RJ45', degreeOfProtection: 'IP20', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Industrial Ethernet RJ45-RJ45 Cable - 5m - IP20', categorySlug: 'rj45-rj45', mpn: 'IE-RJ45-RJ45-002', connectorType: 'RJ45', degreeOfProtection: 'IP20', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Industrial Ethernet RJ45-RJ45 Cable - 10m - IP20', categorySlug: 'rj45-rj45', mpn: 'IE-RJ45-RJ45-003', connectorType: 'RJ45', degreeOfProtection: 'IP20', cableLength: '10m', wireCrossSection: '0.34 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'y-splitter-m12-m12': [
      { description: 'Y Splitter M12-M12 - 2m - IP67', categorySlug: 'y-splitter-m12-m12', mpn: 'YS-M12-M12-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Y Splitter M12-M12 - 5m - IP67', categorySlug: 'y-splitter-m12-m12', mpn: 'YS-M12-M12-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'y-splitter-m12-m8': [
      { description: 'Y Splitter M12-M8 - 2m - IP67', categorySlug: 'y-splitter-m12-m8', mpn: 'YS-M12-M8-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Y Splitter M12-M8 - 5m - IP67', categorySlug: 'y-splitter-m12-m8', mpn: 'YS-M12-M8-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'y-splitter-m8-m8': [
      { description: 'Y Splitter M8-M8 - 2m - IP67', categorySlug: 'y-splitter-m8-m8', mpn: 'YS-M8-M8-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'y-distributor-m12-m12': [
      { description: 'Y Distributor M12-M12 - 2m - IP67', categorySlug: 'y-distributor-m12-m12', mpn: 'YD-M12-M12-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Y Distributor M12-M12 - 5m - IP67', categorySlug: 'y-distributor-m12-m12', mpn: 'YD-M12-M12-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'y-distributor-m12-m8': [
      { description: 'Y Distributor M12-M8 - 2m - IP67', categorySlug: 'y-distributor-m12-m8', mpn: 'YD-M12-M8-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'y-distributor-m8-m8': [
      { description: 'Y Distributor M8-M8 - 2m - IP67', categorySlug: 'y-distributor-m8-m8', mpn: 'YD-M8-M8-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'cord-set-m12-m12': [
      { description: 'Cord Set M12-M12 - 2m - IP67', categorySlug: 'cord-set-m12-m12', mpn: 'CS-M12-M12-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Cord Set M12-M12 - 5m - IP67', categorySlug: 'cord-set-m12-m12', mpn: 'CS-M12-M12-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Cord Set M12-M12 - 10m - IP67', categorySlug: 'cord-set-m12-m12', mpn: 'CS-M12-M12-003', connectorType: 'M12', code: 'B', degreeOfProtection: 'IP67', cableLength: '10m', wireCrossSection: '0.34 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'cord-set-m8-m8': [
      { description: 'Cord Set M8-M8 - 2m - IP67', categorySlug: 'cord-set-m8-m8', mpn: 'CS-M8-M8-001', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Cord Set M8-M8 - 5m - IP67', categorySlug: 'cord-set-m8-m8', mpn: 'CS-M8-M8-002', connectorType: 'M8', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
    'cord-set-m12-m8': [
      { description: 'Cord Set M12-M8 - 2m - IP67', categorySlug: 'cord-set-m12-m8', mpn: 'CS-M12-M8-001', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '2m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
      { description: 'Cord Set M12-M8 - 5m - IP67', categorySlug: 'cord-set-m12-m8', mpn: 'CS-M12-M8-002', connectorType: 'M12', code: 'A', degreeOfProtection: 'IP67', cableLength: '5m', wireCrossSection: '0.25 mm²', cableMantleColor: 'Black', cableMantleMaterial: 'PVC', housingMaterial: 'Plastic', temperatureRange: '-25°C to +85°C' },
    ],
  }

  let totalProducts = 0

  for (const [categorySlug, products] of Object.entries(productsByCategory)) {
    const categoryId = categoryMap.get(categorySlug)
    if (!categoryId) {
      console.error(`  ✗ Category not found: ${categorySlug}`)
      continue
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const sku = await generateSKU(categorySlug, i)

      try {
        await pool.query(
          `INSERT INTO "Product" (
            sku, name, description, "categoryId",
            mpn, "connectorType", coding, "ipRating",
            "cableLength", "wireCrossSection", "cableMantleColor",
            "cableMantleMaterial", "housingMaterial", "temperatureRange",
            images, documents, "createdAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
          ON CONFLICT (sku) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            "categoryId" = EXCLUDED."categoryId",
            "updatedAt" = NOW()`,
          [
            sku,
            product.description,
            product.description,
            categoryId,
            product.mpn ?? null,
            product.connectorType ?? null,
            product.code ?? null,
            product.degreeOfProtection ?? null,
            product.cableLength ?? null,
            product.wireCrossSection ?? null,
            product.cableMantleColor ?? null,
            product.cableMantleMaterial ?? null,
            product.housingMaterial ?? null,
            product.temperatureRange ?? null,
            JSON.stringify([]),
            JSON.stringify([]),
          ]
        )
        totalProducts++
        console.log(`  ✓ Created product: ${product.description}`)
      } catch (error: any) {
        console.error(`  ✗ Failed to create product ${product.description}:`, error.message)
      }
    }
  }

  console.log(`✅ Created ${totalProducts} products\n`)
}

async function runSeed(): Promise<void> {
  const pool = createPool()

  try {
    console.log('🚀 Starting category and product seeding...\n')

    const categoryMap = await seedCategories(pool)
    await seedProducts(pool, categoryMap)

    console.log('✅ Seeding completed successfully!')
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('Seed script completed.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed script failed:', error)
      process.exit(1)
    })
}

export { runSeed }
