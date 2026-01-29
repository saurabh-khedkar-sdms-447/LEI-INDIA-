import { z } from 'zod'

export const contactInfoSchema = z.object({
  phone: z.string().trim().optional(),
  email: z.string().email('Invalid email address').trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  registeredAddress: z.string().trim().optional(),
  factoryLocation2: z.string().trim().optional(),
  regionalContacts: z.object({
    bangalore: z.string().trim().optional(),
    kolkata: z.string().trim().optional(),
    gurgaon: z.string().trim().optional(),
  }).optional(),
})

export type ContactInfoInput = z.infer<typeof contactInfoSchema>
