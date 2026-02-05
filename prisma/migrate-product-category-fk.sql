-- Migration: Convert Product.category from TEXT to UUID foreign key
-- This establishes proper referential integrity between Products and Categories
-- 
-- RISK ASSESSMENT:
-- - Breaking change: Product.category changes from TEXT to UUID
-- - Data migration required: Must map existing category text values to Category IDs
-- - API changes required: All product queries must use categoryId instead of category text
-- - Backward compatibility: None - this is a structural change

-- Step 1: Add new categoryId column (nullable initially)
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "categoryId" UUID REFERENCES "Category"(id) ON DELETE SET NULL;

-- Step 2: Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_product_category_id ON "Product"("categoryId");

-- Step 3: Migrate existing data (if any)
-- This attempts to match existing category text values to Category slugs
-- Products without matching categories will have NULL categoryId
UPDATE "Product" p
SET "categoryId" = c.id
FROM "Category" c
WHERE LOWER(TRIM(p.category)) = LOWER(c.slug)
   OR LOWER(TRIM(p.category)) = LOWER(REPLACE(c.slug, '-', ' '))
   OR LOWER(TRIM(p.category)) LIKE '%' || LOWER(c.slug) || '%';

-- Step 4: Drop the old category TEXT column
-- WARNING: This permanently removes the old category field
-- Uncomment only after verifying data migration was successful
-- ALTER TABLE "Product" DROP COLUMN IF EXISTS category;

-- Step 5: Rename categoryId to category (optional - keeps API simpler)
-- ALTER TABLE "Product" RENAME COLUMN "categoryId" TO "category";

-- Note: The old 'category' column is kept for now to allow gradual migration
-- Remove it after updating all application code to use categoryId
