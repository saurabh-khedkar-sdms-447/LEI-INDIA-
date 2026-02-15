import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export default function PolicyNotFound() {
  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Policy Not Found</CardTitle>
              <CardDescription>
                The policy you&apos;re looking for doesn&apos;t exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/company-policies">View All Policies</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Go to Homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
