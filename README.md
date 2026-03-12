# AI Study Portal

AI Study Portal is a Next.js + TypeScript web app that helps students move from one assignment to a focused study workspace.

Current milestone: **Phase 7 complete — AI-backed server-side portal generation with fallback behavior**.

## What is included

- Landing page with Google sign-in
- Auth-guarded dashboard with Classroom/mock course data
- Assignment detail page with Google Picker integration and extraction preview
- Selected Drive file metadata persisted per session and assignment
- Server-side text extraction with per-file status
- AI-backed structured portal generation from assignment metadata + extracted text
- Portal page with generation trigger, status, source labeling, and sources used

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
- `NEXT_PUBLIC_GOOGLE_API_KEY`
- `NEXT_PUBLIC_GOOGLE_APP_ID`
- `AUTH_SESSION_SECRET`
- `OPENAI_API_KEY`

4. Optional values:

- `OPENAI_PORTAL_MODEL` (default: `gpt-4o-mini`)
- `STUDY_DATA_SOURCE=auto|classroom|mock`

5. Run the development server:

```bash
npm run dev
```

6. Open http://localhost:3000

## Environment variables

### Required now

- `GOOGLE_CLIENT_ID` - verified server-side against ID token audience
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google Identity Services client-side init
- `NEXT_PUBLIC_GOOGLE_API_KEY` - required by Google Picker builder
- `NEXT_PUBLIC_GOOGLE_APP_ID` - Google Cloud project number used by Picker
- `AUTH_SESSION_SECRET` - signs HTTP-only session cookie
- `OPENAI_API_KEY` - used server-side for AI portal generation

### Optional now

- `OPENAI_PORTAL_MODEL` - OpenAI model for portal generation (`gpt-4o-mini` by default)
- `STUDY_DATA_SOURCE` - mock vs Classroom selection (`auto`, `classroom`, `mock`)

### Planned for later phases

- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Google scopes used

- Classroom:
  - `https://www.googleapis.com/auth/classroom.courses.readonly`
  - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
- Drive Picker selection and file read for chosen files:
  - `https://www.googleapis.com/auth/drive.file`

Why `drive.file`:
- It is the narrowest practical Drive scope for user-selected files.
- It avoids broad full-drive access.

## Google Cloud Console setup

1. Create or select a Google Cloud project.
2. Configure OAuth consent screen.
3. Add these scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
   - `https://www.googleapis.com/auth/drive.file`
4. Create OAuth 2.0 Client ID (Web application).
5. Add JavaScript origins:
   - `http://localhost:3000`
6. Enable APIs in **APIs & Services → Library**:
   - Google Classroom API
   - Google Drive API
7. Create API key for Picker and set `NEXT_PUBLIC_GOOGLE_API_KEY`.
8. Use your Google Cloud project number as `NEXT_PUBLIC_GOOGLE_APP_ID`.
9. If app is in testing mode, add test users.

## OpenAI setup for this phase

1. Create an OpenAI API key.
2. Set `OPENAI_API_KEY` in `.env.local`.
3. Optionally set `OPENAI_PORTAL_MODEL`.
4. Portal generation is fully server-side; no OpenAI key is exposed to client code.

## File extraction support and limitations

Supported extraction types:
- Google Docs (`application/vnd.google-apps.document`) via Drive export to plain text
- Plain text-like files (`text/*`, `application/json`) via Drive media download

Current behavior:
- Extraction runs server-side and stores assignment-linked extraction records in lightweight in-memory storage.
- Each selected file has extraction status: `not_extracted`, `extracting`, `extracted`, or `failed`.
- Unsupported file types are marked `failed` with a clear error message.
- Raw extracted text is previewed on the assignment detail page.

## Portal generation behavior (this phase)

Generation input:
- assignment title
- assignment instructions
- course name (if available)
- due date (if available)
- normalized text from successfully extracted files only
- per-file source provenance

Generation pipeline:
- normalization trims text, removes excessive whitespace, and applies a conservative per-file length cap
- failed/unsupported extractions are ignored
- AI provider returns strict-schema structured output
- provider output is validated before saving
- `sourcesUsed` provenance is preserved in the final portal object

Fallback behavior:
- if no usable extracted text exists, portal generation returns fallback content and clear status/message
- if OpenAI is unavailable or output validation fails, deterministic fallback portal content is used
- portal page always remains usable with fallback content

Current limitation:
- no chunk retrieval/reranking pipeline yet
- no citation spans in generated sections yet

## Development commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```
