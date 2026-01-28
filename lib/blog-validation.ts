import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  excerpt: z.string().min(1, 'Excerpt is required').trim(),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  image: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().or(z.literal('')).or(z.null()),
})

export const blogUpdateSchema = blogSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
)

export type BlogInput = z.infer<typeof blogSchema>
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>
