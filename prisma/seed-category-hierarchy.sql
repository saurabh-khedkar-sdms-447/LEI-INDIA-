-- Seed script: Create category hierarchy matching the product classification diagram
-- This creates a 3-level hierarchy:
-- Level 1: Main product types (7 categories)
-- Level 2: Sub-types (M8/M12, connector types, etc.)
-- Level 3: Specific configurations (Open End/Cord Set, Shielded/Un-Shielded, etc.)

-- Clear existing categories (CAUTION: This will delete all existing categories)
-- Uncomment only if you want to start fresh
-- TRUNCATE TABLE "Category" CASCADE;

-- Level 1: Main Categories
INSERT INTO "Category" (id, name, slug, description, "parentId", "createdAt", "updatedAt")
VALUES
  -- 1. M8 & M12 Sensor Cable
  (gen_random_uuid(), 'M8 & M12 Sensor Cable', 'm8-m12-sensor-cable', 'M8 and M12 sensor cables for industrial applications', NULL, NOW(), NOW()),
  -- 2. Field Wireable Connector
  (gen_random_uuid(), 'Field Wireable Connector', 'field-wireable-connector', 'Field wireable connectors for M8 and M12 applications', NULL, NOW(), NOW()),
  -- 3. PROFINET
  (gen_random_uuid(), 'PROFINET', 'profinet', 'PROFINET cordsets and cables for Industrial Ethernet', NULL, NOW(), NOW()),
  -- 4. Industrial Ethernet
  (gen_random_uuid(), 'Industrial Ethernet', 'industrial-ethernet', 'Industrial Ethernet cables and connectors', NULL, NOW(), NOW()),
  -- 5. Y Splitter
  (gen_random_uuid(), 'Y Splitter', 'y-splitter', 'Y splitter cables for signal distribution', NULL, NOW(), NOW()),
  -- 6. Y Distributor
  (gen_random_uuid(), 'Y Distributor', 'y-distributor', 'Y distributor cables for signal distribution', NULL, NOW(), NOW()),
  -- 7. Cord Set
  (gen_random_uuid(), 'Cord Set', 'cord-set', 'Pre-assembled cord sets with connectors', NULL, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "parentId" = EXCLUDED."parentId",
  "updatedAt" = NOW()
RETURNING id, slug;

-- Level 2: Sub-categories (using CTE to get parent IDs)
WITH parent_categories AS (
  SELECT id, slug FROM "Category" WHERE "parentId" IS NULL
)
INSERT INTO "Category" (id, name, slug, description, "parentId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  subcat.name,
  subcat.slug,
  subcat.description,
  pc.id,
  NOW(),
  NOW()
FROM parent_categories pc
CROSS JOIN (VALUES
  -- M8 & M12 Sensor Cable children
  ('m8-m12-sensor-cable', 'M8 Sensor Cable', 'm8-sensor-cable', 'M8 sensor cables'),
  ('m8-m12-sensor-cable', 'M12 Sensor Cable', 'm12-sensor-cable', 'M12 sensor cables'),
  -- Field Wireable Connector children
  ('field-wireable-connector', 'M8 Connector', 'm8-connector', 'M8 field wireable connectors'),
  ('field-wireable-connector', 'M12 Connector', 'm12-connector', 'M12 field wireable connectors'),
  -- PROFINET children
  ('profinet', 'RJ45-M12', 'rj45-m12', 'PROFINET RJ45 to M12 cordsets'),
  ('profinet', 'RJ45-M8', 'rj45-m8', 'PROFINET RJ45 to M8 cordsets'),
  -- Industrial Ethernet children
  ('industrial-ethernet', 'RJ45-RJ45', 'rj45-rj45', 'Industrial Ethernet RJ45 to RJ45 cables'),
  -- Y Splitter children
  ('y-splitter', 'M12-M12', 'y-splitter-m12-m12', 'Y splitter M12 to M12'),
  ('y-splitter', 'M12-M8', 'y-splitter-m12-m8', 'Y splitter M12 to M8'),
  ('y-splitter', 'M8-M8', 'y-splitter-m8-m8', 'Y splitter M8 to M8'),
  -- Y Distributor children
  ('y-distributor', 'M12-M12', 'y-distributor-m12-m12', 'Y distributor M12 to M12'),
  ('y-distributor', 'M12-M8', 'y-distributor-m12-m8', 'Y distributor M12 to M8'),
  ('y-distributor', 'M8-M8', 'y-distributor-m8-m8', 'Y distributor M8 to M8'),
  -- Cord Set children
  ('cord-set', 'M12-M12', 'cord-set-m12-m12', 'Cord set M12 to M12'),
  ('cord-set', 'M8-M8', 'cord-set-m8-m8', 'Cord set M8 to M8'),
  ('cord-set', 'M12-M8', 'cord-set-m12-m8', 'Cord set M12 to M8')
) AS subcat(parent_slug, name, slug, description)
WHERE pc.slug = subcat.parent_slug
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "parentId" = EXCLUDED."parentId",
  "updatedAt" = NOW();

-- Level 3: Specific configurations
WITH level2_categories AS (
  SELECT c.id, c.slug
  FROM "Category" c
  JOIN "Category" p ON c."parentId" = p.id
  WHERE p."parentId" IS NULL  -- Level 2 categories have level 1 parents
)
INSERT INTO "Category" (id, name, slug, description, "parentId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  config.name,
  config.slug,
  config.description,
  l2.id,
  NOW(),
  NOW()
FROM level2_categories l2
CROSS JOIN (VALUES
  -- M8 Sensor Cable configurations
  ('m8-sensor-cable', 'Open End', 'm8-sensor-cable-open-end', 'M8 sensor cable with open end'),
  ('m8-sensor-cable', 'Cord Set', 'm8-sensor-cable-cord-set', 'M8 sensor cable cord set'),
  -- M12 Sensor Cable configurations
  ('m12-sensor-cable', 'Open End', 'm12-sensor-cable-open-end', 'M12 sensor cable with open end'),
  ('m12-sensor-cable', 'Cord Set', 'm12-sensor-cable-cord-set', 'M12 sensor cable cord set'),
  -- M8 Connector configurations
  ('m8-connector', 'Shielded', 'm8-connector-shielded', 'M8 shielded connector'),
  ('m8-connector', 'Un-Shielded', 'm8-connector-unshielded', 'M8 unshielded connector'),
  -- M12 Connector configurations
  ('m12-connector', 'Shielded', 'm12-connector-shielded', 'M12 shielded connector'),
  ('m12-connector', 'Un-Shielded', 'm12-connector-unshielded', 'M12 unshielded connector')
) AS config(parent_slug, name, slug, description)
WHERE l2.slug = config.parent_slug
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "parentId" = EXCLUDED."parentId",
  "updatedAt" = NOW();

-- Verify the hierarchy
SELECT 
  c1.name as "Level 1",
  c2.name as "Level 2",
  c3.name as "Level 3"
FROM "Category" c1
LEFT JOIN "Category" c2 ON c2."parentId" = c1.id
LEFT JOIN "Category" c3 ON c3."parentId" = c2.id
WHERE c1."parentId" IS NULL
ORDER BY c1.name, c2.name, c3.name;
