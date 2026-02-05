'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from './ProductCard'
import { ProductPagination } from './ProductPagination'
import { Product } from '@/types'

interface ProductsResponse {
  products: Product[]
  pagination: {
    limit: number
    cursor: string | null
    hasNext: boolean
    hasPrev: boolean
  }
}

export function ProductList() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<ProductsResponse['pagination']>({
    limit: 20,
    cursor: null,
    hasNext: false,
    hasPrev: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      // Build filter params
      const categoryId = searchParams.get('categoryId')
      if (categoryId) params.set('categoryId', categoryId)
      
      const connectorType = searchParams.get('connectorType')
      if (connectorType) params.set('connectorType', connectorType)
      
      const code = searchParams.get('code')
      if (code) params.set('code', code)
      
      const degreeOfProtection = searchParams.get('degreeOfProtection')
      if (degreeOfProtection) params.set('degreeOfProtection', degreeOfProtection)
      
      const search = searchParams.get('search')
      if (search) params.set('search', search)
      
      // Cursor-based pagination
      const cursor = searchParams.get('cursor')
      if (cursor) params.set('cursor', cursor)
      
      const limit = searchParams.get('limit')
      if (limit) params.set('limit', limit)

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">No products found matching your criteria.</p>
        <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <ProductPagination
        cursor={products.length > 0 ? products[products.length - 1].id : null}
        nextCursor={pagination.cursor}
        hasNext={pagination.hasNext}
        hasPrev={pagination.hasPrev}
      />
    </>
  )
}
