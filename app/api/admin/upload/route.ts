import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { checkAdmin } from '@/lib/auth-middleware'
import { log } from '@/lib/logger'
import { csrfProtection } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'

const uploadsDir = join(process.cwd(), 'public', 'uploads')
const documentsDir = join(process.cwd(), 'public', 'documents')
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024 // 50MB in bytes for documents

// POST /api/admin/upload - upload product image or document (admin)
export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfResponse = csrfProtection(req)
  if (csrfResponse) {
    return csrfResponse
  }

  // Rate limiting - prevent file upload DoS
  const rateLimitResponse = await rateLimit(req, { maxRequests: 10, windowSeconds: 60 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const auth = checkAdmin(req)
    if (auth instanceof NextResponse) return auth

    const formData = await req.formData()
    const file = formData.get('image') || formData.get('document')
    const fileType = formData.get('type') as string || 'image' // 'image' or 'document'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (fileType === 'document') {
      // Handle document uploads (PDF, Word)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      ]
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only PDF and Word documents are allowed (.pdf, .doc, .docx)' },
          { status: 400 },
        )
      }

      // Check file size for documents
      if (file.size > MAX_DOCUMENT_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds maximum allowed size of ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB` },
          { status: 400 },
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await mkdir(documentsDir, { recursive: true })

      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const filename = `product-doc-${Date.now()}-${randomUUID()}.${ext}`
      const filePath = join(documentsDir, filename)

      await writeFile(filePath, buffer)

      const fileUrl = `/documents/${filename}`

      return NextResponse.json({
        url: fileUrl,
        filename,
        size: buffer.length,
        type: 'document',
      })
    } else {
      // Handle image uploads
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only image files are allowed (jpeg, png, gif, webp)' },
          { status: 400 },
        )
      }

      // Check file size for images
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
          { status: 400 },
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await mkdir(uploadsDir, { recursive: true })

      const ext = file.name.split('.').pop() || 'png'
      const filename = `product-${Date.now()}-${randomUUID()}.${ext}`
      const filePath = join(uploadsDir, filename)

      await writeFile(filePath, buffer)

      const fileUrl = `/uploads/${filename}`

      return NextResponse.json({
        url: fileUrl,
        filename,
        size: buffer.length,
        type: 'image',
      })
    }
  } catch (error) {
    log.error('Upload error', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    )
  }
}

