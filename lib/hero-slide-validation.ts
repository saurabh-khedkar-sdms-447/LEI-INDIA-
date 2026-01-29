import { z } from 'zod'

export const heroSlideSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().max(100, 'Title must be less than 100 characters'),
  subtitle: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  image: z.string().min(1, 'Image URL is required'),
  ctaText: z.string().optional().or(z.literal('')),
  ctaLink: z.string().optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export const heroSlideUpdateSchema = heroSlideSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
)

export type HeroSlideInput = z.infer<typeof heroSlideSchema>
export type HeroSlideUpdateInput = z.infer<typeof heroSlideUpdateSchema>
