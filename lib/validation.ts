import { z } from 'zod'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const uuidSchema = z.string().regex(UUID_REGEX, 'Invalid UUID format')

export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value)
}

export function validateUUID(value: string): string {
  if (!isValidUUID(value)) {
    throw new Error('Invalid UUID format')
  }
  return value
}
