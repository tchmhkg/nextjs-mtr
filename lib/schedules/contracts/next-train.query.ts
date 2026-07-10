import { z } from 'zod'

export const nextTrainQuerySchema = z.object({
  mode: z.enum(['mtr', 'lr']).default('mtr'),
  line: z.string().min(1),
  sta: z.string().min(1),
  lang: z.enum(['tc', 'en']).default('tc'),
})

export type NextTrainQuery = z.infer<typeof nextTrainQuerySchema>
