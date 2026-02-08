import { z } from 'zod'

const uuidSchema = z.string().uuid('Invalid UUID format')

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required').trim(),
  name: z.string().min(1, 'Name is required').trim(),
  mpn: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  categoryId: uuidSchema.optional(),
  productType: z.string().optional(),
  coupling: z.string().optional(),
  degreeOfProtection: z.enum(['IP67', 'IP68', 'IP20']).optional(),
  wireCrossSection: z.string().optional(),
  temperatureRange: z.string().optional(),
  cableDiameter: z.string().optional(),
  cableMantleColor: z.string().optional(),
  cableMantleMaterial: z.string().optional(),
  cableLength: z.string().optional(),
  glandMaterial: z.string().optional(),
  housingMaterial: z.string().optional(),
  pinContact: z.string().optional(),
  socketContact: z.string().optional(),
  cableDragChainSuitable: z.boolean().optional(),
  tighteningTorqueMax: z.string().optional(),
  bendingRadiusFixed: z.string().optional(),
  bendingRadiusRepeated: z.string().optional(),
  contactPlating: z.string().optional(),
  operatingVoltage: z.string().optional(),
  ratedCurrent: z.string().optional(),
  halogenFree: z.boolean().optional(),
  connectorType: z.enum(['M12', 'M8', 'RJ45']).optional(),
  code: z.enum(['A', 'B', 'D', 'X']).optional(),
  strippingForce: z.string().optional(),
  price: z.number().nonnegative('Price must be non-negative').optional(),
  priceType: z.enum(['per_unit', 'per_pack', 'per_bulk']).default('per_unit'),
  inStock: z.boolean().default(false),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be non-negative').optional(),
  images: z.array(z.string()).default([]),
  documents: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    size: z.number().optional(),
  })).default([]),
  datasheetUrl: z.string().optional(),
  drawingUrl: z.string().optional(),
})

export const productUpdateSchema = productSchema.partial()

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

