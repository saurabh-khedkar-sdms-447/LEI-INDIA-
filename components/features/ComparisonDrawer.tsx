'use client'

import { useMemo, useState, useEffect } from 'react'
import { useComparisonStore } from '@/store/comparison-store'
import { Product } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { X } from 'lucide-react'

export function ComparisonDrawer() {
  const { items, clear } = useComparisonStore()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setProducts([])
        return
      }

      try {
        // Fetch all products for comparison in a single batched request
        const ids = Array.from(new Set(items.map((item) => item.id))).join(',')
        const response = await fetch(`/api/products?ids=${encodeURIComponent(ids)}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch comparison products')
        }

        const data = await response.json()
        const products = Array.isArray(data) ? data : (data.products as Product[] | undefined) || []
        setProducts(products)
      } catch {
        setProducts([])
      }
    }
    fetchProducts()
  }, [items])

  const comparedProducts = useMemo(
    () => items.map((i) => products.find((p) => p.id === i.id)).filter(Boolean),
    [items, products]
  )

  if (comparedProducts.length < 2) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="shadow-lg">
            Compare {comparedProducts.length} products
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>Technical Comparison</SheetTitle>
            <Button variant="ghost" size="icon" onClick={clear}>
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Specification</TableHead>
                  {comparedProducts.map((product) => (
                    <TableHead key={product!.id}>{product!.mpn || product!.id}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">MPN</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.mpn || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Description</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.description || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Product Type</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.productType || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Coupling</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.coupling || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Degree of Protection</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.degreeOfProtection || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Wire Cross Section</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.wireCrossSection || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Temperature Range</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.temperatureRange || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cable Diameter</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.cableDiameter || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Color of Cable Mantle</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.cableMantleColor || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Material of Cable Mantle</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.cableMantleMaterial || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cable Length</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.cableLength || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Material of Gland</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.glandMaterial || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Housing Material</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.housingMaterial || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pin Contact</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.pinContact || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Socket Contact</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.socketContact || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cable Drag Chain Suitable</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.cableDragChainSuitable ? 'Yes' : 'No'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tightening Torque Maximum</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.tighteningTorqueMax || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bending Radius (Fixed)</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.bendingRadiusFixed || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bending Radius (Repeated)</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.bendingRadiusRepeated || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Contact Plating</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.contactPlating || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operating Voltage</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.operatingVoltage || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Rated Current</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.ratedCurrent || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Halogen Free</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.halogenFree ? 'Yes' : 'No'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Connector Type</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.connectorType || 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Code</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.code ? `${product!.code}-Code` : 'N/A'}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Stripping Force</TableCell>
                  {comparedProducts.map((product) => (
                    <TableCell key={product!.id}>{product!.strippingForce || 'N/A'}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

