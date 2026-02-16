import { ProductCard } from './ProductCard'
import { ProductPagination } from './ProductPagination'
import { fetchProducts, fetchCategories } from '@/lib/data-fetching'
import type { Product, Category } from '@/types'

interface ProductListServerProps {
  searchParams: {
    categoryId?: string
    category?: string
    connectorType?: string
    code?: string
    degreeOfProtection?: string
    pins?: string
    gender?: string
    inStock?: string
    search?: string
    cursor?: string
    limit?: string
  }
}

export async function ProductListServer({ searchParams }: ProductListServerProps) {
  // Fetch categories once for grouping
  const { categories } = await fetchCategories({ limit: 1000 })
  
  // Convert category slug to categoryId if needed
  let categoryId: string | undefined = searchParams.categoryId
  if (!categoryId && searchParams.category) {
    const category = categories.find(c => c.slug === searchParams.category)
    if (category) {
      categoryId = category.id
    }
  }

  // Build query params
  const queryParams: Parameters<typeof fetchProducts>[0] = {
    categoryId: categoryId ? categoryId.split(',').filter(Boolean) : undefined,
    connectorType: searchParams.connectorType ? searchParams.connectorType.split(',').filter(Boolean) : undefined,
    code: searchParams.code ? searchParams.code.split(',').filter(Boolean) : undefined,
    degreeOfProtection: searchParams.degreeOfProtection ? searchParams.degreeOfProtection.split(',').filter(Boolean) : undefined,
    pins: searchParams.pins ? searchParams.pins.split(',').map(p => parseInt(p, 10)).filter(p => !isNaN(p)) : undefined,
    gender: searchParams.gender ? searchParams.gender.split(',').filter(Boolean) : undefined,
    inStock: searchParams.inStock === 'true' ? true : undefined,
    search: searchParams.search,
    cursor: searchParams.cursor,
    limit: searchParams.limit ? parseInt(searchParams.limit, 10) : 10,
  }

  // Fetch products
  const { products, pagination } = await fetchProducts(queryParams)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">No products found matching your criteria.</p>
        <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  // Check if any filters are applied (excluding pagination params)
  const hasFilters = !!(
    categoryId ||
    searchParams.connectorType ||
    searchParams.code ||
    searchParams.degreeOfProtection ||
    searchParams.pins ||
    searchParams.gender ||
    searchParams.inStock ||
    searchParams.search
  )

  // If no filters are applied, show all products in a flat list
  if (!hasFilters) {
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

  // Group products by category when filters are applied
  const productsByCategory = new Map<string, { category: Category | null; products: Product[] }>()
  
  // Create a map for quick category lookup
  const categoryMap = new Map<string, Category>()
  categories.forEach(cat => {
    categoryMap.set(cat.id, cat)
  })
  
  // Group products
  products.forEach(product => {
    const catId = product.categoryId || 'uncategorized'
    const category = product.categoryId ? categoryMap.get(product.categoryId) || null : null
    
    if (!productsByCategory.has(catId)) {
      productsByCategory.set(catId, { category, products: [] })
    }
    productsByCategory.get(catId)!.products.push(product)
  })
  
  // Sort categories: selected categories first, then by name
  const selectedCategoryIds = categoryId ? categoryId.split(',').filter(Boolean) : []
  const sortedCategories = Array.from(productsByCategory.entries()).sort(([idA, dataA], [idB, dataB]) => {
    const isSelectedA = selectedCategoryIds.includes(idA)
    const isSelectedB = selectedCategoryIds.includes(idB)
    
    if (isSelectedA && !isSelectedB) return -1
    if (!isSelectedA && isSelectedB) return 1
    
    const nameA = dataA.category?.name || 'Uncategorized'
    const nameB = dataB.category?.name || 'Uncategorized'
    return nameA.localeCompare(nameB)
  })

  return (
    <>
      <div className="space-y-12">
        {sortedCategories.map(([categoryId, { category, products: categoryProducts }]) => (
          <div key={categoryId}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
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
