import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Coverage policy: gate ≥80% only on pure/schedules logic listed in
 * `coverage.include`. Do not expand to components/pages until we add
 * purposeful React tests — a repo-wide 80% target is noise for this app.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.next', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'utils/mtr-time.ts',
        'utils/geo.ts',
        'utils/locale-path.ts',
        'lib/schedules/client-error.ts',
        'lib/schedules/sanitize-alert-url.ts',
        'lib/schedules/mappers/mtr-schedule.mapper.ts',
        'lib/schedules/mappers/lr-schedule.mapper.ts',
        'lib/schedules/errors/api-error.ts',
        'lib/schedules/http/respond.ts',
        'lib/schedules/http/fresh-guard.ts',
        'lib/schedules/contracts/next-train.query.ts',
        'lib/upstream/lr/client.ts',
        'utils/lr-stations.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'lib'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@i18n': path.resolve(__dirname, 'i18n'),
      '@store': path.resolve(__dirname, 'store'),
      '@components': path.resolve(__dirname, 'components'),
      '@hooks': path.resolve(__dirname, 'hooks'),
    },
  },
})
