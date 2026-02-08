import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { pgPool } from "@/lib/pg"

export const metadata: Metadata = {
  title: "Company Policies",
  description: "View LEI Indias company policies and download official policy documents.",
}

export const dynamic = 'force-dynamic'

interface Policy {
  id: string
  title: string
  slug: string
  content: string
  policyType?: string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

async function getCompanyPolicies(): Promise<Policy[]> {
  try {
    const result = await pgPool.query(
      `
      SELECT id, title, slug, content, "policyType", "displayOrder", active, "createdAt", "updatedAt"
      FROM "CompanyPolicy"
      WHERE active = true
      ORDER BY "displayOrder" ASC, "createdAt" DESC
      `,
    )
    return result.rows
  } catch (error) {
    // Silently return empty array - page will show message
    return []
  }
}

export default async function CompanyPoliciesPage() {
  const policies = await getCompanyPolicies()

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Company Policies
            </h1>
            <p className="text-gray-600 mb-10 max-w-2xl">
              Access and review our official company policies. Click on any policy to view details.
            </p>

            {policies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No active policies available at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {policies.map((policy) => (
                  <Link
                    key={policy.id}
                    href={`/company-policies/${policy.slug}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg md:text-xl">{policy.title}</CardTitle>
                        {policy.policyType && (
                          <p className="text-xs text-gray-500 mt-1">{policy.policyType}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: policy.content.length > 150 
                              ? policy.content.substring(0, 150) + '...' 
                              : policy.content 
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

