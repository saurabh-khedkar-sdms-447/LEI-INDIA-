import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { FilterSidebar } from "@/components/features/FilterSidebar"
import { ComparisonDrawer } from "@/components/features/ComparisonDrawer"
import { ProductListServer } from "@/components/features/ProductListServer"
import { fetchCategoryBySlug, fetchCategoryById } from "@/lib/data-fetching"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our complete catalog of M12, M8, RJ45, and PROFINET industrial connectors and cables.",
}

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Get active category name if category filter is applied - using direct DB query
  const categorySlug = searchParams.category as string | undefined
  const categoryId = searchParams.categoryId as string | undefined
  
  let activeCategory = null
  if (categoryId) {
    activeCategory = await fetchCategoryById(categoryId)
  } else if (categorySlug) {
    activeCategory = await fetchCategoryBySlug(categorySlug)
  }
  
  const pageTitle = activeCategory ? activeCategory.name : 'Industrial Connectors & Cables'

  // Normalize searchParams for ProductListServer
  const normalizedSearchParams = {
    categoryId: typeof searchParams.categoryId === 'string' ? searchParams.categoryId : undefined,
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    connectorType: typeof searchParams.connectorType === 'string' ? searchParams.connectorType : undefined,
    code: typeof searchParams.code === 'string' ? searchParams.code : undefined,
    degreeOfProtection: typeof searchParams.degreeOfProtection === 'string' ? searchParams.degreeOfProtection : undefined,
    pins: typeof searchParams.pins === 'string' ? searchParams.pins : undefined,
    gender: typeof searchParams.gender === 'string' ? searchParams.gender : undefined,
    inStock: typeof searchParams.inStock === 'string' ? searchParams.inStock : undefined,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    cursor: typeof searchParams.cursor === 'string' ? searchParams.cursor : undefined,
    limit: typeof searchParams.limit === 'string' ? searchParams.limit : undefined,
  }

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {pageTitle}
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <FilterSidebar />
            </aside>

            {/* Product Grid */}
            <div className="flex-1 pb-16">
              <Suspense fallback={
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">Loading products...</p>
                </div>
              }>
                <ProductListServer searchParams={normalizedSearchParams} />
              </Suspense>
            </div>
          </div>
        </div>
        <ComparisonDrawer />
      </main>
      <Footer />
    </>
  )
}
