# AI Study Portal

AI Study Portal is a Next.js + TypeScript web app that helps students move from one assignment to a focused study workspace.

Current milestone: **Phase 2 complete — Google sign-in + basic session handling**.

## What is included

- Landing page with Google sign-in
- Auth-guarded dashboard with courses and assignments
- Assignment detail page with mock Google Picker-style material selection
- Study portal page with structured output sections
- Shared TypeScript domain types and mock study repository layer
- Server-assisted auth APIs for sign-in, session read, and sign-out

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

3. Fill in required auth values in `.env.local`:

- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `AUTH_SESSION_SECRET`

4. Run the development server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Environment variables

### Required now (Phase 2)

- `GOOGLE_CLIENT_ID` - validated server-side against ID token audience
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - used by Google Identity Services button in client UI
- `AUTH_SESSION_SECRET` - signs the HTTP-only session cookie

### Planned for later phases

- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Google Cloud Console setup (required for sign-in)

1. Create or select a Google Cloud project.
2. Configure **OAuth consent screen** (External or Internal based on your org).
3. Create an **OAuth 2.0 Client ID** for Web application.
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
5. Use the created client ID for both:
   - `GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
6. If your app is in testing mode, add your Google account as a test user.

## Development commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Notes

- This phase intentionally adds auth only.
- Google Classroom, Drive, Docs, and Picker APIs are not integrated yet.
- Business logic remains in `lib` modules so UI components stay presentation-focused.
