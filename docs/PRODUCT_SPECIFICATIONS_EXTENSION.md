# Product Specifications Extension

## Overview

Extended the Product table to support additional technical specifications based on CSV import requirements. All new fields are optional to maintain backward compatibility.

## New Fields Added

The following fields have been added to the `Product` table:

| CSV Column | Database Field | Type | Description |
|------------|---------------|------|-------------|
| Mpn | `mpn` | TEXT | Manufacturer Part Number |
| Product Type | `productType` | TEXT | Product Type classification |
| Coupling | `coupling` | TEXT | Coupling type |
| Wire Cross Section | `wireCrossSection` | TEXT | Wire cross section specification |
| Cable Diameter | `cableDiameter` | TEXT | Cable diameter |
| Color of the Cable Mantle | `cableMantleColor` | TEXT | Color of the cable mantle |
| Material of the Cable Mantle | `cableMantleMaterial` | TEXT | Material of the cable mantle |
| Material of Gland | `glandMaterial` | TEXT | Material of the gland |
| Housing Material | `housingMaterial` | TEXT | Housing material |
| Pin Contact | `pinContact` | TEXT | Pin contact specification |
| Socket Contact | `socketContact` | TEXT | Socket contact specification |
| Cable Drag Chain Suitable | `cableDragChainSuitable` | BOOLEAN | Whether cable is suitable for drag chains |
| Tightening Torque maximum | `tighteningTorqueMax` | TEXT | Maximum tightening torque |
| Bending Radius (Fixed) | `bendingRadiusFixed` | TEXT | Bending radius for fixed installation |
| Bending Radius (Repeated) | `bendingRadiusRepeated` | TEXT | Bending radius for repeated bending |
| Contact Plating | `contactPlating` | TEXT | Contact plating material |
| Halogen free | `halogenFree` | BOOLEAN | Whether product is halogen-free |
| Stripping Force | `strippingForce` | TEXT | Stripping force specification |

## Field Mappings

Existing CSV columns map to existing fields:
- `Description` → `description`
- `Degree of protection` → `ipRating`
- `Wire Cross Section` → `wireGauge` (existing field, also added `wireCrossSection` for clarity)
- `Temperature Range` → `temperatureRange`
- `Cable Length` → `cableLength`
- `Operating Voltage` → `voltage`
- `Rated Current` → `current`
- `Connector Type` → `connectorType`
- `Code` → `coding`

## Migration

### For Existing Databases

Run the migration script to add the new columns:

```bash
psql -U postgres -d <database_name> -f prisma/migrate-add-product-specs.sql
```

### For New Installations

The new fields are already included in `prisma/schema.sql`, so new database setups will automatically include these fields.

## API Changes

### Request Body

All new fields are optional and should be included in the `specifications` object:

```json
{
  "sku": "PROD-001",
  "name": "Product Name",
  "specifications": {
    "material": "Plastic",
    "voltage": "125V",
    "current": "1.5A",
    "temperatureRange": "-40°C to 85°C",
    "mpn": "MPN-12345",
    "productType": "Connector",
    "coupling": "Threaded",
    "wireCrossSection": "0.5mm²",
    "cableDiameter": "6mm",
    "cableMantleColor": "Black",
    "cableMantleMaterial": "PVC",
    "glandMaterial": "Brass",
    "housingMaterial": "Plastic",
    "pinContact": "Gold plated",
    "socketContact": "Gold plated",
    "cableDragChainSuitable": true,
    "tighteningTorqueMax": "2.5 Nm",
    "bendingRadiusFixed": "50mm",
    "bendingRadiusRepeated": "75mm",
    "contactPlating": "Gold",
    "halogenFree": true,
    "strippingForce": "50N"
  }
}
```

### Response

All product API endpoints now return the new fields in the response:

- `GET /api/products` - Returns all products with new fields
- `GET /api/products/:id` - Returns single product with new fields
- `POST /api/products` - Creates product with new fields
- `PUT /api/products/:id` - Updates product with new fields

## Backward Compatibility

✅ **All changes are backward compatible:**
- All new fields are nullable (optional)
- Existing products continue to work without modification
- Existing API calls continue to work
- No breaking changes to existing validation rules

## Indexes

The following indexes have been added for performance:

- `idx_product_mpn` - For MPN lookups
- `idx_product_halogen_free` - For filtering halogen-free products
- `idx_product_drag_chain` - For filtering drag chain suitable products

## Validation

All new fields are optional in the validation schema. The existing required fields remain unchanged:
- `material` (required)
- `voltage` (required)
- `current` (required)
- `temperatureRange` (required)

## TypeScript Types

The `Product` interface in `types/index.ts` has been updated to include all new fields in the `specifications` object.

## Next Steps

1. Run the migration script on your database
2. Update admin product forms to include new fields (optional)
3. Import CSV data using the new fields
4. Update product display pages to show new specifications (optional)
