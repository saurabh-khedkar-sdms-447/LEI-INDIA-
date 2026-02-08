export type ConnectorType = 'M12' | 'M8' | 'RJ45'
export type ConnectorCoding = 'A' | 'B' | 'D' | 'X'
export type IPRating = 'IP67' | 'IP68' | 'IP20'
export type PinCount = 3 | 4 | 5 | 8 | 12
export type ConnectorGender = 'Male' | 'Female'

export interface Product {
  id: string
  sku: string
  name: string
  mpn?: string
  description: string
  categoryId?: string
  productType?: string
  coupling?: string
  degreeOfProtection?: IPRating // IP Rating
  wireCrossSection?: string
  temperatureRange?: string
  cableDiameter?: string
  cableMantleColor?: string
  cableMantleMaterial?: string
  cableLength?: string
  glandMaterial?: string
  housingMaterial?: string
  pinContact?: string
  socketContact?: string
  cableDragChainSuitable?: boolean
  tighteningTorqueMax?: string
  bendingRadiusFixed?: string
  bendingRadiusRepeated?: string
  contactPlating?: string
  operatingVoltage?: string
  ratedCurrent?: string
  halogenFree?: boolean
  connectorType?: ConnectorType
  code?: ConnectorCoding
  strippingForce?: string
  price?: number
  priceType?: 'per_unit' | 'per_pack' | 'per_bulk'
  inStock?: boolean
  stockQuantity?: number
  images: string[]
  documents?: Array<{
    url: string
    filename: string
    size?: number
  }>
  datasheetUrl?: string
  drawingUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  parentId?: string
  parent?: Category // Populated parent category (optional)
  children?: Category[] // Populated child categories (optional)
}

export interface RFQItem {
  productId: string
  sku: string
  name: string
  quantity: number
  notes?: string
}

export interface RFQ {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  companyAddress?: string
  items: RFQItem[]
  notes?: string
  status: 'pending' | 'quoted' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface FilterState {
  connectorType?: ConnectorType[]
  coding?: ConnectorCoding[]
  pins?: PinCount[]
  ipRating?: IPRating[]
  gender?: ConnectorGender[]
  inStock?: boolean
  search?: string
  category?: string // Category slug (for backward compatibility)
  categoryId?: string // Category UUID (new preferred method)
}
