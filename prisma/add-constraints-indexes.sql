-- Add missing foreign key constraints and indexes for production readiness
-- Run this after the main schema.sql

-- Add foreign key constraint for Product.categoryId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_categoryid_fkey'
  ) THEN
    ALTER TABLE "Product" 
    ADD CONSTRAINT product_categoryid_fkey 
    FOREIGN KEY ("categoryId") 
    REFERENCES "Category"(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for Category.parentId (self-reference)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'category_parentid_fkey'
  ) THEN
    ALTER TABLE "Category" 
    ADD CONSTRAINT category_parentid_fkey 
    FOREIGN KEY ("parentId") 
    REFERENCES "Category"(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for Product.categoryId (for faster joins)
CREATE INDEX IF NOT EXISTS idx_product_categoryid ON "Product"("categoryId");

-- Add composite index for Product search (name, sku, description)
CREATE INDEX IF NOT EXISTS idx_product_search ON "Product" USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(sku, '') || ' ' || COALESCE(description, '')));

-- Add index for Product price queries
CREATE INDEX IF NOT EXISTS idx_product_price ON "Product"(price) WHERE price IS NOT NULL;

-- Add index for Order email (for customer lookup)
CREATE INDEX IF NOT EXISTS idx_order_email ON "Order"(email);

-- Add index for Inquiry email (for customer lookup)
CREATE INDEX IF NOT EXISTS idx_inquiry_email ON "Inquiry"(email);

-- Add index for Inquiry responded status
CREATE INDEX IF NOT EXISTS idx_inquiry_responded ON "Inquiry"(responded);

-- Add index for Blog search (title, excerpt)
CREATE INDEX IF NOT EXISTS idx_blog_search ON "Blog" USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(excerpt, '')));

-- Add index for Career search (title, department, location)
CREATE INDEX IF NOT EXISTS idx_career_search ON "Career" USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(department, '') || ' ' || COALESCE(location, '')));

-- Add check constraints for data integrity
ALTER TABLE "Product" 
  ADD CONSTRAINT product_pins_check 
  CHECK (pins IS NULL OR (pins >= 3 AND pins <= 12));

ALTER TABLE "Product" 
  ADD CONSTRAINT product_price_check 
  CHECK (price IS NULL OR price >= 0);

ALTER TABLE "Product" 
  ADD CONSTRAINT product_stock_quantity_check 
  CHECK ("stockQuantity" IS NULL OR "stockQuantity" >= 0);

ALTER TABLE "OrderItem" 
  ADD CONSTRAINT orderitem_quantity_check 
  CHECK (quantity > 0);

ALTER TABLE "HeroSlide" 
  ADD CONSTRAINT hero_slide_display_order_check 
  CHECK ("displayOrder" >= 0);

-- Add unique constraint for Product SKU (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_sku_key'
  ) THEN
    ALTER TABLE "Product" 
    ADD CONSTRAINT product_sku_key UNIQUE (sku);
  END IF;
END $$;

-- Add unique constraint for Category slug (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'category_slug_key'
  ) THEN
    ALTER TABLE "Category" 
    ADD CONSTRAINT category_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add unique constraint for Blog slug (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_slug_key'
  ) THEN
    ALTER TABLE "Blog" 
    ADD CONSTRAINT blog_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add unique constraint for Career slug (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'career_slug_key'
  ) THEN
    ALTER TABLE "Career" 
    ADD CONSTRAINT career_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add NOT NULL constraints where appropriate
ALTER TABLE "Product" 
  ALTER COLUMN sku SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN "priceType" SET NOT NULL,
  ALTER COLUMN "inStock" SET NOT NULL,
  ALTER COLUMN images SET NOT NULL,
  ALTER COLUMN documents SET NOT NULL;

ALTER TABLE "Category" 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE "Blog" 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN published SET NOT NULL;

ALTER TABLE "Career" 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN active SET NOT NULL;

ALTER TABLE "HeroSlide" 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN image SET NOT NULL,
  ALTER COLUMN "displayOrder" SET NOT NULL,
  ALTER COLUMN active SET NOT NULL;

ALTER TABLE "Order" 
  ALTER COLUMN "companyName" SET NOT NULL,
  ALTER COLUMN "contactName" SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE "OrderItem" 
  ALTER COLUMN "orderId" SET NOT NULL,
  ALTER COLUMN sku SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL;

ALTER TABLE "Inquiry" 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN subject SET NOT NULL,
  ALTER COLUMN message SET NOT NULL,
  ALTER COLUMN read SET NOT NULL,
  ALTER COLUMN responded SET NOT NULL;

-- Add default values where missing
ALTER TABLE "Product" 
  ALTER COLUMN "priceType" SET DEFAULT 'per_unit',
  ALTER COLUMN "inStock" SET DEFAULT FALSE,
  ALTER COLUMN images SET DEFAULT '[]'::jsonb,
  ALTER COLUMN documents SET DEFAULT '[]'::jsonb;

ALTER TABLE "Blog" 
  ALTER COLUMN published SET DEFAULT FALSE;

ALTER TABLE "Career" 
  ALTER COLUMN active SET DEFAULT TRUE;

ALTER TABLE "HeroSlide" 
  ALTER COLUMN "displayOrder" SET DEFAULT 0,
  ALTER COLUMN active SET DEFAULT TRUE;

ALTER TABLE "Order" 
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE "Inquiry" 
  ALTER COLUMN read SET DEFAULT FALSE,
  ALTER COLUMN responded SET DEFAULT FALSE;
