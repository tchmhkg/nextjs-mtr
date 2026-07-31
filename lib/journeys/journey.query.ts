import { z } from 'zod'

export const journeyQuerySchema = z.object({
  origin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,4}$/),
  destination: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,4}$/),
  includeWaiting: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => v === 'true' || v === '1'),
})

export type JourneyQuery = z.infer<typeof journeyQuerySchema>
