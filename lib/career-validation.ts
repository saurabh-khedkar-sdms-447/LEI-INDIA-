import { z } from 'zod'

export const careerSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  location: z.string().min(1, 'Location is required').trim(),
  type: z.string().min(1, 'Type is required').trim(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  salary: z.string().optional(),
  active: z.boolean().default(true),
})

export const careerUpdateSchema = careerSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
)

export type CareerInput = z.infer<typeof careerSchema>
export type CareerUpdateInput = z.infer<typeof careerUpdateSchema>
