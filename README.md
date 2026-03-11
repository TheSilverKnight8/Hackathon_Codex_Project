# AI Study Portal

AI Study Portal is a Next.js + TypeScript web app that helps students move from one assignment to a focused study workspace.

Current milestone: **Phase 3 complete — Google sign-in + server-side Google Classroom read-only integration with mock fallback**.

## What is included

- Landing page with Google sign-in
- Auth-guarded dashboard
- Server-side Google Classroom course + coursework retrieval
- Assignment detail page and study portal page using repository-backed data
- Mock fallback flow when Classroom data is unavailable

## Tech stack

- Next.js (App Router)
- React
- TypeScript

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill required values in `.env.local`:

- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `AUTH_SESSION_SECRET`

4. Optional data source switch:

- `STUDY_DATA_SOURCE=auto` (default, try Classroom then fallback)
- `STUDY_DATA_SOURCE=classroom` (attempt Classroom first, still graceful fallback on runtime failure)
- `STUDY_DATA_SOURCE=mock` (always use mock data)

5. Run the development server:

```bash
npm run dev
```

6. Open http://localhost:3000

## Environment variables

### Required now

- `GOOGLE_CLIENT_ID` - checked server-side against ID token audience
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - used by Google Identity Services in browser
- `AUTH_SESSION_SECRET` - signs the HTTP-only session cookie

### Optional now

- `STUDY_DATA_SOURCE` - controls mock vs Classroom usage (`auto`, `classroom`, `mock`)

### Planned for later phases

- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Google Cloud Console setup (Phase 3)

1. Create or select a Google Cloud project.
2. Configure the OAuth consent screen.
3. Add these OAuth scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
4. Create an OAuth 2.0 Client ID for Web application.
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
6. In **APIs & Services → Library**, enable **Google Classroom API**.
7. Use the client ID for both:
   - `GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
8. If app is in testing mode, add test users.

## Development commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Classroom fallback behavior

- If Classroom token/scopes are missing, dashboard uses mock data and shows a clear message.
- If Classroom API is unavailable, dashboard falls back to mock data and shows a warning.
- If Classroom works but user has no active courses, dashboard shows an empty state.

## Notes

- This phase adds Classroom read-only integration only.
- Drive, Docs, and Google Picker integrations are intentionally not implemented yet.
- UI components remain presentation-focused; provider logic stays in auth/service/repository layers.
