import { z } from 'zod'

export const nextTrainQuerySchema = z.object({
  mode: z.enum(['mtr', 'lr']).default('mtr'),
  line: z.string().min(1),
  sta: z.string().min(1),
  lang: z.enum(['tc', 'en']).default('tc'),
  /** Bypass server/CDN caches and hit upstream fresh. */
  fresh: z
    .enum(['0', '1', 'true', 'false'])
    .optional()
    .transform((v) => v === '1' || v === 'true'),
})

export type NextTrainQuery = z.infer<typeof nextTrainQuerySchema>
