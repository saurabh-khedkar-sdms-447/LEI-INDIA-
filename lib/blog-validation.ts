import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  slug: z.string().min(1, 'Slug is required').trim().optional(),
  excerpt: z.string().min(1, 'Excerpt is required').trim(),
  content: z.string().min(1, 'Content is required').trim(),
  image: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
})

export const blogUpdateSchema = blogSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
)

export type BlogInput = z.infer<typeof blogSchema>
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>
