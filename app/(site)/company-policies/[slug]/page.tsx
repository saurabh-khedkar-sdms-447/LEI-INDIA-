import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, FileText } from "lucide-react"
import Link from "next/link"
import { pgPool } from "@/lib/pg"

export const dynamic = 'force-dynamic'

interface PolicyPageProps {
  params: { slug: string }
}

interface Policy {
  id: string
  title: string
  slug: string
  content: string
  policyType?: string
  attachments?: string[] | string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  try {
    const result = await pgPool.query(
      `
      SELECT id, title, slug, content, "policyType", attachments, "displayOrder", active, "createdAt", "updatedAt"
      FROM "CompanyPolicy"
      WHERE slug = $1 AND active = true
      LIMIT 1
      `,
      [slug],
    )
    
    if (result.rows.length === 0) {
      return null
    }

    const policy = result.rows[0]
    // Normalize attachments to always be an array
    const attachments = Array.isArray(policy.attachments) 
      ? policy.attachments 
      : (policy.attachments ? [policy.attachments] : [])

    return {
      ...policy,
      attachments,
    }
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const policy = await getPolicyBySlug(params.slug)
  
  if (!policy) {
    return {
      title: "Policy Not Found",
    }
  }

  return {
    title: policy.title,
    description: `View ${policy.title} - LEI Indias Company Policy`,
  }
}

export default async function PolicyDetailPage({ params }: PolicyPageProps) {
  const policy = await getPolicyBySlug(params.slug)

  if (!policy) {
    notFound()
  }

  // Normalize attachments
  const attachments = Array.isArray(policy.attachments) 
    ? policy.attachments 
    : (policy.attachments ? [policy.attachments] : [])

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/company-policies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Policies
              </Link>
            </Button>

            {/* Policy Header */}
            <article>
              <header className="mb-8">
                {policy.policyType && (
                  <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
                    {policy.policyType}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {policy.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div>
                    Last updated: {new Date(policy.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </header>

              {/* Policy Content */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: policy.content }}
                  />
                </CardContent>
              </Card>

              {/* Attachments */}
              {attachments.length > 0 && (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Attachments
                    </h2>
                    <div className="space-y-2">
                      {attachments.map((attachment, index) => {
                        // Handle both string URLs and object attachments
                        const attachmentUrl = typeof attachment === 'string' 
                          ? attachment 
                          : (attachment as any)?.url || (attachment as any)?.path || ''
                        const attachmentName = typeof attachment === 'string'
                          ? attachment.split('/').pop() || `Attachment ${index + 1}`
                          : (attachment as any)?.name || (attachment as any)?.filename || `Attachment ${index + 1}`

                        if (!attachmentUrl) return null

                        return (
                          <a
                            key={index}
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Download className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{attachmentName}</span>
                          </a>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Back to Policies Button */}
              <div className="mt-12 pt-8 border-t">
                <Button asChild variant="outline">
                  <Link href="/company-policies">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Policies
                  </Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
