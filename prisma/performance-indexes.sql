-- Performance optimization indexes for common query patterns
-- These indexes significantly improve query performance for filtered product searches

-- Composite index for category + inStock filtering (common homepage query)
CREATE INDEX IF NOT EXISTS idx_product_categoryid_in_stock 
ON "Product"("categoryId", "inStock") 
WHERE "inStock" = true;

-- Composite index for category + connectorType filtering
CREATE INDEX IF NOT EXISTS idx_product_categoryid_connector_type 
ON "Product"("categoryId", "connectorType") 
WHERE "connectorType" IS NOT NULL;

-- Composite index for category + code filtering
CREATE INDEX IF NOT EXISTS idx_product_categoryid_code 
ON "Product"("categoryId", coding) 
WHERE coding IS NOT NULL;

-- Composite index for category + ipRating filtering
CREATE INDEX IF NOT EXISTS idx_product_categoryid_ip_rating 
ON "Product"("categoryId", "ipRating") 
WHERE "ipRating" IS NOT NULL;

-- Composite index for category + pins filtering
CREATE INDEX IF NOT EXISTS idx_product_categoryid_pins 
ON "Product"("categoryId", pins) 
WHERE pins IS NOT NULL;

-- Composite index for category + gender filtering
CREATE INDEX IF NOT EXISTS idx_product_categoryid_gender 
ON "Product"("categoryId", gender) 
WHERE gender IS NOT NULL;

-- Composite index for cursor-based pagination with category
-- This is critical for fast pagination when filtering by category
CREATE INDEX IF NOT EXISTS idx_product_categoryid_id_asc 
ON "Product"("categoryId", id) 
WHERE "categoryId" IS NOT NULL;

-- Composite index for cursor-based pagination with inStock
CREATE INDEX IF NOT EXISTS idx_product_in_stock_id_asc 
ON "Product"("inStock", id) 
WHERE "inStock" = true;

-- GIN index for full-text search on name, sku, description, and mpn
-- This enables fast ILIKE searches
CREATE INDEX IF NOT EXISTS idx_product_search_gin 
ON "Product" USING gin(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(sku, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(mpn, '')
  )
);

-- Partial index for published blogs (already exists but ensuring it's optimal)
CREATE INDEX IF NOT EXISTS idx_blog_published_created_at 
ON "Blog"(published, "createdAt" DESC) 
WHERE published = true;

-- Index for category slug lookups (already exists but ensuring it's optimal)
CREATE INDEX IF NOT EXISTS idx_category_slug_unique 
ON "Category"(slug);

-- Composite index for products ordered by creation date (homepage)
CREATE INDEX IF NOT EXISTS idx_product_in_stock_created_at_desc 
ON "Product"("inStock", "createdAt" DESC) 
WHERE "inStock" = true;
