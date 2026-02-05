-- Migration: Add extended product specification fields
-- This migration adds new columns to support detailed product specifications
-- All new fields are nullable to maintain backward compatibility
-- 
-- Run this migration as a PostgreSQL superuser:
--   psql -U postgres -d <database_name> -f prisma/migrate-add-product-specs.sql

-- Add new product specification fields
ALTER TABLE "Product" 
  ADD COLUMN IF NOT EXISTS "mpn" TEXT,
  ADD COLUMN IF NOT EXISTS "productType" TEXT,
  ADD COLUMN IF NOT EXISTS "coupling" TEXT,
  ADD COLUMN IF NOT EXISTS "wireCrossSection" TEXT,
  ADD COLUMN IF NOT EXISTS "cableDiameter" TEXT,
  ADD COLUMN IF NOT EXISTS "cableMantleColor" TEXT,
  ADD COLUMN IF NOT EXISTS "cableMantleMaterial" TEXT,
  ADD COLUMN IF NOT EXISTS "glandMaterial" TEXT,
  ADD COLUMN IF NOT EXISTS "housingMaterial" TEXT,
  ADD COLUMN IF NOT EXISTS "pinContact" TEXT,
  ADD COLUMN IF NOT EXISTS "socketContact" TEXT,
  ADD COLUMN IF NOT EXISTS "cableDragChainSuitable" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "tighteningTorqueMax" TEXT,
  ADD COLUMN IF NOT EXISTS "bendingRadiusFixed" TEXT,
  ADD COLUMN IF NOT EXISTS "bendingRadiusRepeated" TEXT,
  ADD COLUMN IF NOT EXISTS "contactPlating" TEXT,
  ADD COLUMN IF NOT EXISTS "halogenFree" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "strippingForce" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "Product"."mpn" IS 'Manufacturer Part Number';
COMMENT ON COLUMN "Product"."productType" IS 'Product Type classification';
COMMENT ON COLUMN "Product"."coupling" IS 'Coupling type';
COMMENT ON COLUMN "Product"."wireCrossSection" IS 'Wire cross section specification';
COMMENT ON COLUMN "Product"."cableDiameter" IS 'Cable diameter';
COMMENT ON COLUMN "Product"."cableMantleColor" IS 'Color of the cable mantle';
COMMENT ON COLUMN "Product"."cableMantleMaterial" IS 'Material of the cable mantle';
COMMENT ON COLUMN "Product"."glandMaterial" IS 'Material of the gland';
COMMENT ON COLUMN "Product"."housingMaterial" IS 'Housing material';
COMMENT ON COLUMN "Product"."pinContact" IS 'Pin contact specification';
COMMENT ON COLUMN "Product"."socketContact" IS 'Socket contact specification';
COMMENT ON COLUMN "Product"."cableDragChainSuitable" IS 'Whether cable is suitable for drag chains';
COMMENT ON COLUMN "Product"."tighteningTorqueMax" IS 'Maximum tightening torque';
COMMENT ON COLUMN "Product"."bendingRadiusFixed" IS 'Bending radius for fixed installation';
COMMENT ON COLUMN "Product"."bendingRadiusRepeated" IS 'Bending radius for repeated bending';
COMMENT ON COLUMN "Product"."contactPlating" IS 'Contact plating material';
COMMENT ON COLUMN "Product"."halogenFree" IS 'Whether product is halogen-free';
COMMENT ON COLUMN "Product"."strippingForce" IS 'Stripping force specification';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_product_mpn ON "Product"("mpn") WHERE "mpn" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_halogen_free ON "Product"("halogenFree") WHERE "halogenFree" = true;
CREATE INDEX IF NOT EXISTS idx_product_drag_chain ON "Product"("cableDragChainSuitable") WHERE "cableDragChainSuitable" = true;
