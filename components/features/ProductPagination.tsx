'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductPaginationProps {
  cursor: string | null // Last product id on current page (for next page)
  nextCursor: string | null // Next cursor from API (for validation)
  hasNext: boolean
  hasPrev: boolean
}

export function ProductPagination({ cursor, nextCursor, hasNext, hasPrev }: ProductPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateCursor = (newCursor: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newCursor) {
      params.set('cursor', newCursor)
    } else {
      params.delete('cursor')
    }
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  const handleNext = () => {
    // Use the last product id as cursor for next page
    if (cursor && hasNext) {
      updateCursor(cursor)
    }
  }

  const handlePrev = () => {
    // For cursor-based pagination, we need to track previous cursors
    // For simplicity, we'll reset to first page
    updateCursor(null)
  }

  if (!hasNext && !hasPrev) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrev}
        disabled={!hasPrev}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={!hasNext || !cursor}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
