import { isKnownLrStation } from '@utils/lr-stations'
import { isKnownLineSta } from '@utils/next-train-data'
import { z } from 'zod'

export const nextTrainQuerySchema = z
  .object({
    mode: z.enum(['mtr', 'lr']).default('mtr'),
    line: z.string().min(1).optional(),
    sta: z.string().min(1),
    lang: z.enum(['tc', 'en']).default('tc'),
    /** Bypass server/CDN caches and hit upstream fresh. */
    fresh: z
      .enum(['0', '1', 'true', 'false'])
      .optional()
      .transform((v) => v === '1' || v === 'true'),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'mtr') {
      if (!data.line) {
        ctx.addIssue({
          code: 'custom',
          message: 'line is required for mtr mode',
          path: ['line'],
        })
        return
      }
      if (!isKnownLineSta(data.line, data.sta)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown line/station pair: ${data.line}-${data.sta}`,
          path: ['sta'],
        })
      }
      return
    }

    if (!isKnownLrStation(data.sta)) {
      ctx.addIssue({
        code: 'custom',
        message: `Unknown Light Rail station: ${data.sta}`,
        path: ['sta'],
      })
    }
  })

export type NextTrainQuery = z.infer<typeof nextTrainQuerySchema>
