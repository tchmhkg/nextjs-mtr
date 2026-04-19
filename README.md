# NextMTRTrain

A [Next.js](https://nextjs.org/) app that shows **MTR next-train** information: line and station pickers, live schedules via the project API route, English and Traditional Chinese UI, and light/dark theme.

Live deployment: [nextjs-mtr.vercel.app](https://nextjs-mtr.vercel.app)

## Requirements

- **Node.js** 20.9 or newer (see `engines` in `package.json`)

## Setup

```bash
yarn install
cp .env.local.example .env.local
# Edit .env.local if you use Sentry (see below).
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `yarn dev`    | Development server       |
| `yarn build`  | Production build         |
| `yarn start`  | Run production server    |
| `yarn lint`   | ESLint                   |

## Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **UI:** styled-components, Sass modules where used
- **State:** Redux Toolkit + react-redux (line/station selection)
- **Data:** SWR for client fetching; route handler under `/api/mtr/next-train`
- **i18n:** next-intl
- **Monitoring (optional):** Sentry (`@sentry/nextjs`)
- **UX:** nextjs-toploader for route progress; date-fns for times

Formatting in the editor is typically handled with **Prettier** and **ESLint** (flat config: `eslint.config.mjs`, extends Next core-web-vitals + Prettier).

## Environment variables

Copy `.env.local.example` to `.env.local`. For local Sentry source maps or error reporting, set the `SENTRY_*` and `NEXT_PUBLIC_SENTRY_*` values as needed; they can stay empty if you are not using Sentry.
