import { z } from 'zod'

export const contactInfoSchema = z.object({
  phone: z.string().min(1, 'Phone is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  registeredAddress: z.string().optional(),
  factoryLocation2: z.string().optional(),
  regionalContacts: z.object({
    bangalore: z.string().optional(),
    kolkata: z.string().optional(),
    gurgaon: z.string().optional(),
  }).optional(),
})

export type ContactInfoInput = z.infer<typeof contactInfoSchema>
