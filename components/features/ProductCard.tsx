'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useRFQStore } from '@/store/rfq-store'
import { useComparisonStore } from '@/store/comparison-store'
import { Product } from '@/types'
import { CheckCircle2, FileText, Scale } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const addItem = useRFQStore((state) => state.addItem)
  const { items, toggleItem } = useComparisonStore()
  const isSelectedForCompare = items.some((i) => i.id === product.id)

  const handleAddToRFQ = () => {
    addItem({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: 1,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {product.images && product.images.length > 0 && product.images[0] && !imageError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {product.inStock && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              In Stock
            </Badge>
          )}
        </div>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="text-sm">SKU: {product.sku}</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Checkbox
                id={`compare-${product.id}`}
                checked={isSelectedForCompare}
                onCheckedChange={() => toggleItem(product)}
                aria-label={`${isSelectedForCompare ? 'Remove' : 'Add'} ${product.name} to comparison`}
              />
              <label
                htmlFor={`compare-${product.id}`}
                className="text-xs text-gray-600 cursor-pointer flex items-center gap-1"
              >
                <Scale className="h-3 w-3" aria-hidden="true" />
                Compare
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.connectorType && (
              <Badge variant="outline">{product.connectorType}</Badge>
            )}
            {product.coding && (
              <Badge variant="outline">{product.coding}-Code</Badge>
            )}
            {product.pins && (
              <Badge variant="outline">{product.pins} Pin</Badge>
            )}
            {product.ipRating && (
              <Badge variant="outline">{product.ipRating}</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleAddToRFQ}
            className="flex-1"
            size="sm"
            aria-label={`Add ${product.name} to RFQ`}
          >
            Add to RFQ
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1"
            size="sm"
            aria-label={`View specifications for ${product.name}`}
          >
            <Link href={`/products/${product.id}`}>
              <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
              Specs
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
