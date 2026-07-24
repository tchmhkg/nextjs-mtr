import { isKnownLrRoute, isKnownLrStation } from '@utils/lr-data'
import { isKnownLineSta } from '@utils/next-train-data'
import { z } from 'zod'

export const nextTrainQuerySchema = z
  .object({
    mode: z.enum(['mtr', 'lr']).default('mtr'),
    line: z.string().min(1).optional(),
    sta: z.string().min(1),
    lang: z.enum(['tc', 'en']).default('tc'),
    /** LR UI-only route direction; ignored by upstream. */
    dir: z.enum(['1', '2']).optional(),
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
    if (data.line && !isKnownLrRoute(data.line)) {
      ctx.addIssue({
        code: 'custom',
        message: `Unknown Light Rail route: ${data.line}`,
        path: ['line'],
      })
    }
  })

export type NextTrainQuery = z.infer<typeof nextTrainQuerySchema>
