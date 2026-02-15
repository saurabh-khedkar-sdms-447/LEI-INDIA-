import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, FileText, Video, MessageSquare, Download, BookOpen } from "lucide-react"
import Link from "next/link"
import { pgPool } from "@/lib/pg"

export const metadata: Metadata = {
  title: "Technical Support",
  description: "Get technical support for our products. Access documentation, guides, and expert assistance.",
}

export const dynamic = 'force-dynamic'

const supportOptions = [
  {
    icon: FileText,
    title: "Product Documentation",
    description: "Comprehensive technical documentation, datasheets, and specifications for all our products.",
    link: "/resources",
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Step-by-step video guides for installation, configuration, and troubleshooting.",
    link: "/resources",
  },
  {
    icon: Download,
    title: "Downloads & Software",
    description: "Download drivers, firmware updates, configuration tools, and software utilities.",
    link: "/resources",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Search our extensive knowledge base for answers to common technical questions.",
    link: "/resources",
  },
  {
    icon: MessageSquare,
    title: "Live Technical Support",
    description: "Chat with our technical experts for real-time assistance with your technical questions.",
    link: "/contact",
  },
  {
    icon: Wrench,
    title: "Installation Support",
    description: "Get help with product installation, wiring, and configuration from our technical team.",
    link: "/contact",
  },
]


async function getTechnicalSupportContent() {
  try {
    const result = await pgPool.query(
      `
      SELECT id, section, title, content, "displayOrder", "createdAt", "updatedAt"
      FROM "TechnicalSupportContent"
      ORDER BY "displayOrder" ASC, "createdAt" ASC
      `,
    )
    return result.rows
  } catch (error) {
    // Silently return empty array - page will show default content
    return []
  }
}

function getContentBySection(contents: any[], section: string) {
  return contents.find(c => c.section === section)
}

function formatSupportTopicContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }
  
  const trimmed = content.trim()
  if (!trimmed) {
    return ''
  }
  
  // Remove any existing HTML tags to get clean text for processing
  const textOnly = trimmed.replace(/<[^>]*>/g, '').trim()
  
  // If content is plain text (no HTML tags), convert to list format
  if (!trimmed.includes('<') && !trimmed.includes('>')) {
    const lines = trimmed.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      return `<ul class="space-y-2 list-none m-0 p-0">${lines.map(line => `<li class="flex items-start gap-2 text-gray-600"><span class="text-primary mt-1 font-bold">•</span><span>${line.trim()}</span></li>`).join('')}</ul>`
    }
    // Even single word/line should be in a list
    return `<ul class="space-y-2 list-none m-0 p-0"><li class="flex items-start gap-2 text-gray-600"><span class="text-primary mt-1 font-bold">•</span><span>${trimmed}</span></li></ul>`
  }
  
  // If content has HTML, check if it's a list
  if (trimmed.includes('<ul') || trimmed.includes('<li')) {
    let formatted = trimmed
    
    // Style <ul> tags
    formatted = formatted.replace(/<ul[^>]*>/gi, '<ul class="space-y-2 list-none m-0 p-0">')
    
    // Style <li> tags - wrap content with bullet if not already present
    formatted = formatted.replace(/<li[^>]*>(.*?)<\/li>/gis, (match, innerContent) => {
      const innerTrimmed = innerContent.trim()
      // Check if bullet already exists
      if (innerTrimmed.includes('•') || innerTrimmed.includes('<span class="text-primary')) {
        // Already has bullet styling, just ensure proper classes
        return match.replace(/<li[^>]*>/, '<li class="flex items-start gap-2 text-gray-600">')
      }
      // Add bullet styling
      return `<li class="flex items-start gap-2 text-gray-600"><span class="text-primary mt-1 font-bold">•</span><span>${innerTrimmed}</span></li>`
    })
    
    return formatted
  }
  
  // If HTML but not a list, extract text and convert to list
  const lines = textOnly.split('\n').filter(line => line.trim())
  if (lines.length > 0) {
    return `<ul class="space-y-2 list-none m-0 p-0">${lines.map(line => `<li class="flex items-start gap-2 text-gray-600"><span class="text-primary mt-1 font-bold">•</span><span>${line.trim()}</span></li>`).join('')}</ul>`
  }
  
  // Fallback: wrap any content in list
  return `<ul class="space-y-2 list-none m-0 p-0"><li class="flex items-start gap-2 text-gray-600"><span class="text-primary mt-1 font-bold">•</span><span>${textOnly || trimmed}</span></li></ul>`
}

export default async function TechnicalSupportPage() {
  const contents = await getTechnicalSupportContent()
  const heroContent = getContentBySection(contents, 'hero')
  const supportOptionsContent = getContentBySection(contents, 'support-options')
  const contactContent = getContentBySection(contents, 'contact-info')
  
  // Get all support-topics content entries (can be multiple for cards)
  const supportTopicsContent = contents
    .filter(c => c.section === 'support-topics')
    .sort((a, b) => {
      // Sort by displayOrder first, then by createdAt
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  
  // Get all other content sections that don't match known sections
  const knownSections = ['hero', 'support-options', 'support-topics', 'contact-info']
  const otherContent = contents
    .filter(c => !knownSections.includes(c.section))
    .sort((a, b) => {
      // Sort by displayOrder first, then by createdAt
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {heroContent ? (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {heroContent.title || 'Technical Support'}
                  </h1>
                  <div 
                    className="text-xl text-gray-600 mb-8 prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: heroContent.content }}
                  />
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Technical Support
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Expert technical assistance for all our products
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {supportOptionsContent ? (
              <div className="max-w-4xl mx-auto">
                {supportOptionsContent.title && (
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {supportOptionsContent.title}
                    </h2>
                  </div>
                )}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: supportOptionsContent.content }}
                />
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    How We Can Help
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Access technical resources and get expert support
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {supportOptions.map((option, index) => {
                    const Icon = option.icon
                    return (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{option.title}</CardTitle>
                          <CardDescription>{option.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* <Button asChild variant="outline" className="w-full">
                            <Link href={option.link}>Access Resource</Link>
                          </Button> */}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Support Topics */}
        {supportTopicsContent.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Popular Support Topics
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore our comprehensive support resources and guides
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {supportTopicsContent.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white h-full flex flex-col"
                  >
                    <CardHeader className="pb-4">
                      {topic.title && (
                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                          {topic.title}
                        </CardTitle>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <div 
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatSupportTopicContent(topic.content || '') }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Support */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {contactContent?.title || 'Need Direct Technical Support?'}
                  </CardTitle>
                  {contactContent ? (
                    <div 
                      className="text-base prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: contactContent.content }}
                    />
                  ) : (
                    <CardDescription className="text-base">
                      Our technical support team is available to help with complex issues, custom configurations, and specialized technical questions.
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {!contactContent && (
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold mb-2">When contacting technical support, please provide:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>Product model number and part number</li>
                          <li>Detailed description of the issue or question</li>
                          <li>Error messages or symptoms (if applicable)</li>
                          <li>Your application environment and requirements</li>
                          <li>Photos or diagrams (if helpful)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="pt-4">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/contact">Contact Technical Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Content Sections */}
        {otherContent.length > 0 && (
          <>
            {otherContent.map((content) => (
              <section key={content.id} className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    {content.title && (
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                        {content.title}
                      </h2>
                    )}
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                  </div>
                </div>
              </section>
            ))}
          </>
        )}

        {/* CTA Section */}
        {/* <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Our Resources
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Browse our comprehensive resource library for documentation, guides, and more
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link href="/resources">View Resources</Link>
            </Button>
          </div>
        </section> */}
      </main>
      <Footer />
    </>
  )
}
