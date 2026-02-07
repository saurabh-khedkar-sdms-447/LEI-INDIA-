-- Migration: Add drawingUrl column to Product table
-- This adds support for product drawing downloads separate from datasheet
-- 
-- RISK ASSESSMENT:
-- - Non-breaking change: New optional column
-- - No data migration required: Column is nullable
-- - Backward compatible: Existing code will continue to work

-- Step 1: Add drawingUrl column (nullable)
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "drawingUrl" TEXT;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN "Product"."drawingUrl" IS 'URL to product drawing file (PDF, image, or CAD file)';

-- Note: No index needed as this is a simple text field used for direct lookups by product ID
