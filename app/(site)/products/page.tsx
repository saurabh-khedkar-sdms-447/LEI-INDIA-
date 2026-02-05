import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { FilterSidebar } from "@/components/features/FilterSidebar"
import { ComparisonDrawer } from "@/components/features/ComparisonDrawer"
import { ProductList } from "@/components/features/ProductList"
import { Category } from "@/types"
import { log } from "@/lib/logger"
import { Suspense } from "react"

// Helper function to fetch categoryId from category slug
async function getCategoryIdFromSlug(slug: string | undefined): Promise<string | undefined> {
  if (!slug) return undefined
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const response = await fetch(`${baseUrl}/api/categories?limit=1000`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      log.error('Failed to fetch categories for slug lookup')
      return undefined
    }
    
    const data = await response.json()
    const categories: Category[] = Array.isArray(data) ? data : (data.categories || [])
    const category = categories.find(c => c.slug === slug)
    return category?.id
  } catch (error) {
    log.error('Error fetching category by slug', error)
    return undefined
  }
}

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our complete catalog of M12, M8, RJ45, and PROFINET industrial connectors and cables.",
}

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getCategoryInfo(searchParams: ProductsPageProps['searchParams']): Promise<Category | null> {
  const categorySlug = searchParams.category as string | undefined
  const categoryId = searchParams.categoryId as string | undefined
  
  if (!categorySlug && !categoryId) return null
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    let category: Category | null = null
    
    if (categoryId) {
      const response = await fetch(`${baseUrl}/api/categories?limit=1000`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        const categories: Category[] = Array.isArray(data) ? data : (data.categories || [])
        category = categories.find(c => c.id === categoryId) || null
      }
    } else if (categorySlug) {
      const response = await fetch(`${baseUrl}/api/categories?limit=1000`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        const categories: Category[] = Array.isArray(data) ? data : (data.categories || [])
        category = categories.find(c => c.slug === categorySlug) || null
      }
    }
    
    return category
  } catch (error) {
    log.error('Error fetching category for display', error)
    return null
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Get active category name if category filter is applied
  const activeCategory = await getCategoryInfo(searchParams)
  const pageTitle = activeCategory ? activeCategory.name : 'Industrial Connectors & Cables'

  // Convert category slug to categoryId if needed
  const categorySlug = searchParams.category as string | undefined
  const categoryId = searchParams.categoryId as string | undefined || await getCategoryIdFromSlug(categorySlug)

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
                <ProductList />
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
