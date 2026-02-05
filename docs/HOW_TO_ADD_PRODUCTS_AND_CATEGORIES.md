# How to Add Products and Categories

This guide explains how to add categories and products to the system, and how to connect them together.

## Overview

- **Categories** organize products into groups (e.g., "M12 Connectors", "M8 Connectors")
- **Products** belong to a category via the `categoryId` field
- Categories can have parent categories for hierarchical organization

---

## Step 1: Create a Category

### API Endpoint
```
POST /api/categories
```

### Authentication
- Requires admin authentication (admin_token cookie)
- Requires CSRF token in header: `X-CSRF-Token`

### Request Body Format

```json
{
  "name": "M12 Connectors",
  "slug": "m12-connectors",
  "description": "Professional M12 industrial connectors for sensors and actuators",
  "image": "https://example.com/image.jpg",
  "parentId": null
}
```

### Field Requirements

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | Category display name | "M12 Connectors" |
| `slug` | string | ✅ Yes | URL-friendly identifier (lowercase, numbers, hyphens only) | "m12-connectors" |
| `description` | string | ❌ No | Category description | "Professional M12..." |
| `image` | string | ❌ No | Image URL (must be valid URL or empty string) | "https://..." |
| `parentId` | string (UUID) | ❌ No | Parent category ID for hierarchies | null or UUID |

### Example Request (cURL)

```bash
# First, get CSRF token
CSRF_TOKEN=$(curl -c cookies.txt -b cookies.txt http://localhost:3000/api/csrf-token | jq -r '.token')

# Create category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "M12 Connectors",
    "slug": "m12-connectors",
    "description": "Professional M12 industrial connectors",
    "image": "",
    "parentId": null
  }'
```

### Example Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "M12 Connectors",
  "slug": "m12-connectors",
  "description": "Professional M12 industrial connectors",
  "image": null,
  "parentId": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Important**: Save the `id` from the response - you'll need it to connect products to this category!

---

## Step 2: Get Category ID

If you already have categories, fetch them to get their IDs:

### API Endpoint
```
GET /api/categories
```

### Example Request

```bash
curl http://localhost:3000/api/categories
```

### Example Response

```json
{
  "categories": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "M12 Connectors",
      "slug": "m12-connectors",
      ...
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "M8 Connectors",
      "slug": "m8-connectors",
      ...
    }
  ],
  "pagination": { ... }
}
```

---

## Step 3: Create a Product

### API Endpoint
```
POST /api/products
```

### Authentication
- Requires admin authentication (admin_token cookie)
- Requires CSRF token in header: `X-CSRF-Token`

### Request Body Format

```json
{
  "description": "M12 4-Pin Male Connector IP67",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "mpn": "CONN-M12-4M-IP67",
  "productType": "Connector",
  "coupling": "Threaded",
  "degreeOfProtection": "IP67",
  "wireCrossSection": "0.5-4mm²",
  "temperatureRange": "-25°C to +85°C",
  "cableDiameter": "4-8mm",
  "cableMantleColor": "Black",
  "cableMantleMaterial": "PVC",
  "cableLength": "2m",
  "glandMaterial": "Brass",
  "housingMaterial": "Plastic",
  "pinContact": "Gold-plated",
  "socketContact": null,
  "cableDragChainSuitable": true,
  "tighteningTorqueMax": "0.8 Nm",
  "bendingRadiusFixed": "40mm",
  "bendingRadiusRepeated": "60mm",
  "contactPlating": "Gold",
  "operatingVoltage": "250V",
  "ratedCurrent": "4A",
  "halogenFree": false,
  "connectorType": "M12",
  "code": "A",
  "strippingForce": "50N",
  "images": ["https://example.com/image1.jpg"],
  "documents": [
    {
      "url": "https://example.com/datasheet.pdf",
      "filename": "datasheet.pdf",
      "size": 1024000
    }
  ]
}
```

### Field Requirements

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `description` | string | ✅ Yes | Product description/name | "M12 4-Pin Male Connector" |
| `categoryId` | string (UUID) | ❌ No | **Category ID to connect product** | "550e8400-..." |
| `mpn` | string | ❌ No | Manufacturer Part Number | "CONN-M12-4M" |
| `productType` | string | ❌ No | Product type | "Connector" |
| `coupling` | string | ❌ No | Coupling type | "Threaded" |
| `degreeOfProtection` | enum | ❌ No | IP rating: "IP67", "IP68", "IP20" | "IP67" |
| `wireCrossSection` | string | ❌ No | Wire cross section | "0.5-4mm²" |
| `temperatureRange` | string | ❌ No | Operating temperature | "-25°C to +85°C" |
| `cableDiameter` | string | ❌ No | Cable diameter | "4-8mm" |
| `cableMantleColor` | string | ❌ No | Cable color | "Black" |
| `cableMantleMaterial` | string | ❌ No | Cable material | "PVC" |
| `cableLength` | string | ❌ No | Cable length | "2m" |
| `glandMaterial` | string | ❌ No | Gland material | "Brass" |
| `housingMaterial` | string | ❌ No | Housing material | "Plastic" |
| `pinContact` | string | ❌ No | Pin contact type | "Gold-plated" |
| `socketContact` | string | ❌ No | Socket contact type | null |
| `cableDragChainSuitable` | boolean | ❌ No | Drag chain suitable | true |
| `tighteningTorqueMax` | string | ❌ No | Max tightening torque | "0.8 Nm" |
| `bendingRadiusFixed` | string | ❌ No | Fixed bending radius | "40mm" |
| `bendingRadiusRepeated` | string | ❌ No | Repeated bending radius | "60mm" |
| `contactPlating` | string | ❌ No | Contact plating | "Gold" |
| `operatingVoltage` | string | ❌ No | Operating voltage | "250V" |
| `ratedCurrent` | string | ❌ No | Rated current | "4A" |
| `halogenFree` | boolean | ❌ No | Halogen-free | false |
| `connectorType` | enum | ❌ No | Connector type: "M12", "M8", "RJ45" | "M12" |
| `code` | enum | ❌ No | Coding: "A", "B", "D", "X" | "A" |
| `strippingForce` | string | ❌ No | Stripping force | "50N" |
| `images` | array | ❌ No | Array of image URLs | ["https://..."] |
| `documents` | array | ❌ No | Array of document objects | [{url, filename, size}] |

### Example Request (cURL)

```bash
# Get CSRF token
CSRF_TOKEN=$(curl -c cookies.txt -b cookies.txt http://localhost:3000/api/csrf-token | jq -r '.token')

# Create product with category connection
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "description": "M12 4-Pin Male Connector IP67",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "mpn": "CONN-M12-4M-IP67",
    "connectorType": "M12",
    "degreeOfProtection": "IP67",
    "code": "A"
  }'
```

### Example Response

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "description": "M12 4-Pin Male Connector IP67",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "mpn": "CONN-M12-4M-IP67",
  "productType": null,
  "coupling": null,
  "degreeOfProtection": "IP67",
  ...
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

## Step 4: Connect Product to Category

### Method 1: During Product Creation (Recommended)

Include the `categoryId` in the product creation request:

```json
{
  "description": "Product Name",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Method 2: Update Existing Product

Use the PUT endpoint to update a product's category:

```
PUT /api/products/{productId}
```

```json
{
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Example Request

```bash
# Update product category
curl -X PUT http://localhost:3000/api/products/770e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "categoryId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

## Complete Workflow Example

### 1. Create Category

```bash
# Get CSRF token
CSRF_TOKEN=$(curl -c cookies.txt -b cookies.txt http://localhost:3000/api/csrf-token | jq -r '.token')

# Create category
CATEGORY_RESPONSE=$(curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "M12 Connectors",
    "slug": "m12-connectors",
    "description": "Professional M12 industrial connectors"
  }')

# Extract category ID
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.id')
echo "Category ID: $CATEGORY_ID"
```

### 2. Create Product with Category

```bash
# Create product connected to category
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d "{
    \"description\": \"M12 4-Pin Male Connector IP67\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"mpn\": \"CONN-M12-4M-IP67\",
    \"connectorType\": \"M12\",
    \"degreeOfProtection\": \"IP67\"
  }"
```

---

## Common Patterns

### Creating Hierarchical Categories

```json
// 1. Create parent category
{
  "name": "Connectors",
  "slug": "connectors",
  "parentId": null
}

// 2. Create child category
{
  "name": "M12 Connectors",
  "slug": "m12-connectors",
  "parentId": "parent-category-id-here"
}
```

### Filtering Products by Category

```
GET /api/products?categoryId=550e8400-e29b-41d4-a716-446655440000
```

### Products Without Category

You can create products without a category by omitting `categoryId` or setting it to `null`:

```json
{
  "description": "Uncategorized Product",
  "categoryId": null
}
```

---

## Error Handling

### Missing Category ID

If you try to use a non-existent `categoryId`, you'll get a foreign key constraint error:

```json
{
  "error": "Failed to create product"
}
```

**Solution**: Verify the category exists first using `GET /api/categories`

### Invalid UUID Format

The `categoryId` must be a valid UUID format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "categoryId",
      "message": "Invalid UUID format"
    }
  ]
}
```

### Missing Migration

If you see this error:

```json
{
  "error": "Database schema migration required",
  "message": "The categoryId column is missing. Please run: pnpm migrate:category-id",
  "code": "MIGRATION_REQUIRED"
}
```

**Solution**: Run the migration:
```bash
pnpm migrate:category-id
```

---

## Summary

1. **Create Category** → Get `categoryId` from response
2. **Create Product** → Include `categoryId` in request body
3. **Or Update Product** → Use PUT with `categoryId` to connect existing product

The connection is made via the `categoryId` field, which must be a valid UUID that exists in the Category table.
