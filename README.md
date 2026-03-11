# AI Study Portal

AI Study Portal is a Next.js + TypeScript web app that helps students move from one assignment to a focused study workspace.

Current milestone: **MVP shell with mock data only** (no real Google OAuth, Classroom, or Google Picker integration yet).

## What is included

- Landing page
- Dashboard with courses and assignments
- Assignment detail page with mock Google Picker-style material selection
- Study portal page with structured output sections
- Shared TypeScript domain types and mock repository layer

## Tech stack

- Next.js (App Router)
- React
- TypeScript

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open http://localhost:3000

## Environment variables

Copy `.env.example` to `.env.local` and fill values when real integrations are implemented.

Required for planned integrations:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`

Optional:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Development commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Notes

- This phase intentionally uses mock data and no backend integrations.
- Business logic is kept in `lib/studyRepository.ts` so UI components stay simple.
- The structure is ready to extend with Google OAuth, Google Classroom, and Google Picker in later phases.
