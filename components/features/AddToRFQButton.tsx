'use client'

import { Button } from '@/components/ui/button'
import { Product } from '@/types'
import { useRFQStore } from '@/store/rfq-store'
import { ShoppingCart } from 'lucide-react'

interface AddToRFQButtonProps {
  product: Product
  quantity?: number
}

export function AddToRFQButton({ product, quantity = 1 }: AddToRFQButtonProps) {
  const addItem = useRFQStore((state) => state.addItem)

  const handleAdd = () => {
    // Add item to RFQ (no authentication required)
    addItem({
      productId: product.id,
      sku: product.mpn || product.id,
      name: product.description.substring(0, 50) || product.mpn || product.id,
      quantity,
    })
  }

  return (
    <Button onClick={handleAdd} className="flex-1">
      <ShoppingCart className="h-4 w-4 mr-2" />
      Add to RFQ
    </Button>
  )
}
