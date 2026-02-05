# Category and Product Migration - Implementation Complete

## ✅ Completed Tasks

### 1. Database Schema Updates
- ✅ Created migration script: `prisma/migrate-product-category-fk.sql`
  - Adds `categoryId` UUID column with foreign key to Category table
  - Migrates existing data from text to UUID
  - Preserves old `category` column for backward compatibility

### 2. Category Hierarchy
- ✅ Created seed script: `prisma/seed-category-hierarchy.sql`
  - Creates 3-level category hierarchy matching product classification diagram
  - 7 main categories → 18 sub-categories → 8 specific configurations
  - Idempotent (safe to run multiple times)

### 3. TypeScript Types
- ✅ Updated `types/index.ts`:
  - Added `categoryId?: string` to Product interface
  - Added `categoryInfo?: Category` for populated category data
  - Enhanced Category interface with `parent` and `children` properties
  - Updated FilterState to support both `category` (slug) and `categoryId` (UUID)

### 4. Validation Schema
- ✅ Updated `lib/product-validation.ts`:
  - Added `categoryId` UUID validation
  - Made `category` optional (deprecated but kept for backward compatibility)
  - Added refinement to require either `categoryId` or `category`

### 5. API Routes
- ✅ Updated `app/api/products/route.ts`:
  - GET: Supports filtering by `categoryId` with hierarchy support (includes child categories)
  - GET: Returns `categoryInfo` in product responses
  - POST: Accepts `categoryId` and maps to category if needed
  - Backward compatible: Still supports `category` text filter

- ✅ Updated `app/api/products/[id]/route.ts`:
  - GET: Returns `categoryId` and `categoryInfo`
  - PUT: Accepts `categoryId` for updates
  - Handles both `categoryId` and `category` for backward compatibility

### 6. Admin Interface
- ✅ Updated `app/(admin)/admin/products/page.tsx`:
  - Fetches categories from API
  - Replaced category text input with hierarchical dropdown
  - Displays category hierarchy with indentation
  - Form submission sends `categoryId`
  - Product table displays category name from `categoryInfo`

### 7. Site Interface
- ✅ Updated `app/(site)/products/page.tsx`:
  - Converts category slug to `categoryId` before API call
  - Fetches categories from API for display
  - Maintains backward compatibility with slug-based filtering

- ✅ Updated `components/features/FilterSidebar.tsx`:
  - Fetches categories from API
  - Displays hierarchical category tree
  - Uses category slugs for filtering (converted to `categoryId` server-side)

- ✅ Updated `app/(site)/products/[id]/page.tsx`:
  - Displays category from `categoryInfo` if available
  - Falls back to `category` text for backward compatibility

## 🚀 Next Steps

### Step 1: Run Database Migrations

```bash
# Connect to your database
psql -d your_database_name

# Run the migration to add categoryId column
\i prisma/migrate-product-category-fk.sql

# Seed the category hierarchy
\i prisma/seed-category-hierarchy.sql
```

Or using environment variables:
```bash
export PGDATABASE=your_database_name
export PGHOST=your_host
export PGUSER=your_user
export PGPASSWORD=your_password

psql -f prisma/migrate-product-category-fk.sql
psql -f prisma/seed-category-hierarchy.sql
```

### Step 2: Verify Migration

```sql
-- Check that categoryId column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Product' AND column_name = 'categoryId';

-- Check category hierarchy
SELECT 
  c1.name as "Level 1",
  c2.name as "Level 2",
  c3.name as "Level 3"
FROM "Category" c1
LEFT JOIN "Category" c2 ON c2."parentId" = c1.id
LEFT JOIN "Category" c3 ON c3."parentId" = c2.id
WHERE c1."parentId" IS NULL
ORDER BY c1.name, c2.name, c3.name;

-- Check products with categoryId
SELECT COUNT(*) as "Products with categoryId" 
FROM "Product" 
WHERE "categoryId" IS NOT NULL;
```

### Step 3: Test the Application

1. **Admin Interface**:
   - Navigate to `/admin/products`
   - Create a new product and select a category from the dropdown
   - Verify category hierarchy is displayed correctly
   - Edit an existing product and change its category

2. **Site Interface**:
   - Navigate to `/products`
   - Use the category filter in the sidebar
   - Verify hierarchical categories are displayed
   - Filter by category and verify products are filtered correctly
   - View a product detail page and verify category is displayed

3. **API Testing**:
   ```bash
   # Test GET with categoryId
   curl "http://localhost:3000/api/products?categoryId=<category-uuid>"
   
   # Test GET with category slug (backward compatibility)
   curl "http://localhost:3000/api/products?category=<category-slug>"
   
   # Test POST with categoryId
   curl -X POST "http://localhost:3000/api/products" \
     -H "Content-Type: application/json" \
     -d '{"categoryId": "<category-uuid>", ...}'
   ```

## 📋 Category Hierarchy Structure

The seeded hierarchy matches your product classification diagram:

```
Level 1: Main Categories (7)
├── M8 & M12 Sensor Cable
│   ├── M8 Sensor Cable
│   │   ├── Open End
│   │   └── Cord Set
│   └── M12 Sensor Cable
│       ├── Open End
│       └── Cord Set
├── Field Wireable Connector
│   ├── M8 Connector
│   │   ├── Shielded
│   │   └── Un-Shielded
│   └── M12 Connector
│       ├── Shielded
│       └── Un-Shielded
├── PROFINET
│   ├── RJ45-M12
│   └── RJ45-M8
├── Industrial Ethernet
│   └── RJ45-RJ45
├── Y Splitter
│   ├── M12-M12
│   ├── M12-M8
│   └── M8-M8
├── Y Distributor
│   ├── M12-M12
│   ├── M12-M8
│   └── M8-M8
└── Cord Set
    ├── M12-M12
    ├── M8-M8
    └── M12-M8
```

## 🔄 Backward Compatibility

The implementation maintains backward compatibility:

1. **API**: Accepts both `categoryId` (UUID) and `category` (text/slug)
2. **Database**: Old `category` column is preserved
3. **Frontend**: Converts between slugs and UUIDs automatically
4. **Migration**: Existing products are automatically mapped to categories

## ⚠️ Important Notes

1. **Data Migration**: The migration script attempts to map existing `category` text values to Category IDs. Products without matching categories will have `NULL` categoryId.

2. **Category Cleanup**: After verifying everything works, you can manually update products with `NULL` categoryId or remove the old `category` column:
   ```sql
   -- Only after verifying all products have categoryId
   -- ALTER TABLE "Product" DROP COLUMN IF EXISTS category;
   ```

3. **Performance**: The category hierarchy filtering uses recursive queries. For large hierarchies, consider adding indexes:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_category_parent_id ON "Category"("parentId");
   ```

## 🐛 Troubleshooting

### Products not showing after migration
- Check that products have `categoryId` assigned: `SELECT * FROM "Product" WHERE "categoryId" IS NULL;`
- Manually update products: `UPDATE "Product" SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'category-slug') WHERE category = 'category-name';`

### Category dropdown not showing
- Check browser console for errors
- Verify categories API is accessible: `curl http://localhost:3000/api/categories`
- Check that categories were seeded: `SELECT COUNT(*) FROM "Category";`

### Filter not working
- Verify category slug is correct in URL
- Check API logs for categoryId conversion errors
- Test API directly with categoryId: `curl "http://localhost:3000/api/products?categoryId=<uuid>"`

## 📚 Related Documentation

- [Migration Guide](./CATEGORY_PRODUCT_MIGRATION.md) - Detailed migration steps and risks
- [Schema Documentation](../prisma/schema.sql) - Database schema reference
