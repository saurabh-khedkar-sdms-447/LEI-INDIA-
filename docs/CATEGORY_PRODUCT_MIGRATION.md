# Category and Product Relationship Migration Guide

## Current State Analysis

### Database Schema
- **Category table**: Supports hierarchical structure via `parentId` (self-referencing FK)
- **Product table**: Uses `category` as TEXT field (no referential integrity)
- **Issue**: Products reference categories by text name, not by ID

### Current Problems
1. **No referential integrity**: Products can reference non-existent categories
2. **Inefficient queries**: Category filtering uses `ILIKE` pattern matching
3. **Data inconsistency**: Category names can change, breaking product associations
4. **Flat structure**: Only top-level categories exist, hierarchy from product diagram not implemented

## Proposed Solution

### Phase 1: Database Migration
1. Add `categoryId` UUID column to Product table (FK to Category.id)
2. Migrate existing data: Map text category values to Category IDs
3. Keep old `category` column temporarily for backward compatibility
4. Create category hierarchy matching product classification diagram

### Phase 2: API Updates
1. Update product queries to use `categoryId` instead of `category` text
2. Support both `categoryId` (UUID) and `category` (slug) in filters
3. Update product creation/update to accept `categoryId`

### Phase 3: Frontend Updates
1. Update TypeScript types to include `categoryId`
2. Update admin forms to use category dropdown (UUID selection)
3. Update product display to show category hierarchy
4. Update filters to work with category hierarchy

### Phase 4: Cleanup
1. Remove old `category` TEXT column after all code is updated
2. Update all queries to use `categoryId` exclusively

## Migration Steps

### Step 1: Run Database Migrations

```bash
# 1. Add categoryId column and migrate data
psql -d your_database -f prisma/migrate-product-category-fk.sql

# 2. Seed category hierarchy
psql -d your_database -f prisma/seed-category-hierarchy.sql
```

### Step 2: Verify Data Migration

```sql
-- Check products with categoryId assigned
SELECT COUNT(*) FROM "Product" WHERE "categoryId" IS NOT NULL;

-- Check products without categoryId (need manual mapping)
SELECT DISTINCT category FROM "Product" WHERE "categoryId" IS NULL;

-- Verify category hierarchy
SELECT 
  c1.name as "Level 1",
  c2.name as "Level 2",
  c3.name as "Level 3"
FROM "Category" c1
LEFT JOIN "Category" c2 ON c2."parentId" = c1.id
LEFT JOIN "Category" c3 ON c3."parentId" = c2.id
WHERE c1."parentId" IS NULL
ORDER BY c1.name, c2.name, c3.name;
```

### Step 3: Update Code (Breaking Changes)

**Files that need updates:**

1. **`types/index.ts`**
   - Add `categoryId?: string` to Product interface
   - Keep `category?: string` for backward compatibility (temporary)

2. **`lib/product-validation.ts`**
   - Update schema to accept `categoryId` (UUID) instead of `category` (string)
   - Add validation for categoryId existence

3. **`app/api/products/route.ts`**
   - Update GET: Filter by `categoryId` instead of `category` text
   - Update POST: Accept `categoryId` instead of `category`
   - Support both for transition period

4. **`app/api/products/[id]/route.ts`**
   - Update PUT: Accept `categoryId` instead of `category`

5. **`app/(admin)/admin/products/page.tsx`**
   - Update form to use category dropdown (select by UUID)
   - Fetch categories with hierarchy for display

6. **`app/(site)/products/page.tsx`**
   - Update filtering to use category slug → categoryId mapping
   - Support hierarchical category navigation

7. **`components/features/FilterSidebar.tsx`**
   - Update to work with category hierarchy
   - Support multi-level category selection

## Category Hierarchy Structure

Based on the product classification diagram:

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

## Risks and Mitigation

### Risk 1: Data Loss During Migration
- **Mitigation**: Migration script preserves old `category` column
- **Rollback**: Keep old column until migration verified

### Risk 2: Breaking API Changes
- **Mitigation**: Support both `category` (text) and `categoryId` (UUID) during transition
- **Timeline**: Deprecate `category` after 2-3 release cycles

### Risk 3: Frontend Breaking Changes
- **Mitigation**: Update types gradually, maintain backward compatibility
- **Testing**: Test all product-related pages after updates

### Risk 4: Performance Impact
- **Mitigation**: Add index on `categoryId` (already in migration script)
- **Monitoring**: Watch query performance after migration

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] All existing products have `categoryId` assigned
- [ ] Category hierarchy displays correctly
- [ ] Product filtering by category works
- [ ] Product creation with categoryId works
- [ ] Product update with categoryId works
- [ ] Admin product form displays categories correctly
- [ ] Site product pages show category hierarchy
- [ ] No regressions in existing functionality

## Rollback Plan

If issues occur:

1. **Database rollback**:
   ```sql
   ALTER TABLE "Product" DROP COLUMN IF EXISTS "categoryId";
   ```

2. **Code rollback**: Revert to previous commit that uses `category` TEXT field

3. **Data**: Old `category` column preserved, no data loss

## Next Steps

1. Review and approve migration scripts
2. Run migrations in development environment
3. Test all product-related functionality
4. Update API code to support `categoryId`
5. Update frontend code gradually
6. Monitor production after deployment
7. Remove old `category` column after full migration
