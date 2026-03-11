# AI Study Portal

AI Study Portal is a Next.js + TypeScript web app that helps students move from one assignment to a focused study workspace.

Current milestone: **Phase 4 complete — Google sign-in + Classroom read + Google Picker file metadata selection**.

## What is included

- Landing page with Google sign-in
- Auth-guarded dashboard with Classroom/mock course data
- Assignment detail page with Google Picker integration
- Selected Drive file metadata persisted per session and assignment
- Study portal page (still mock/generated content)

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

4. Optional data source switch:

- `STUDY_DATA_SOURCE=auto` (default)
- `STUDY_DATA_SOURCE=classroom`
- `STUDY_DATA_SOURCE=mock`

5. Run the development server:

```bash
npm run dev
```

6. Open http://localhost:3000

## Environment variables

### Required now

- `GOOGLE_CLIENT_ID` - verified server-side against ID token audience
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google Identity Services client side init
- `NEXT_PUBLIC_GOOGLE_API_KEY` - required by Google Picker builder
- `NEXT_PUBLIC_GOOGLE_APP_ID` - Google Cloud project number used by Picker
- `AUTH_SESSION_SECRET` - signs HTTP-only session cookie

### Optional now

- `STUDY_DATA_SOURCE` - mock vs Classroom selection (`auto`, `classroom`, `mock`)

### Planned for later phases

- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Google scopes used

- Classroom:
  - `https://www.googleapis.com/auth/classroom.courses.readonly`
  - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
- Drive Picker selection:
  - `https://www.googleapis.com/auth/drive.file`

Why `drive.file`:
- It is the narrowest practical Drive scope for user-selected files.
- It avoids broad full-drive access.

## Google Cloud Console setup (Phase 4)

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

## Picker behavior and limitations

- On assignment detail, users can pick Drive files and the app stores selected metadata only.
- Stored metadata includes: id, name, mimeType, webViewLink, icon/thumbnail links, source type, date selected, and assignment id.
- Users can remove selected files from the assignment.
- If no real files are selected, mock/generated materials remain visible as fallback.
- File content extraction/parsing is not implemented yet.

## Development commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```
