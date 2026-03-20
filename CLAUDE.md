# CLAUDE.md — ai-form-builder

## Project Overview

AI-powered form builder. Describe your form in plain English, get a fully structured form instantly, edit it visually, embed it anywhere with a script tag or iframe, and receive submissions in your dashboard or via webhook.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (auth + Postgres)
- **Vercel** (frontend + API routes)
- **Anthropic SDK** (`@anthropic-ai/sdk`)

## Package Manager

**pnpm** — always use `pnpm` instead of `npm` or `yarn`.

## Dev Commands

```bash
pnpm dev          # Start dev server on localhost:3000
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm type-check   # Run tsc --noEmit
```

## Two Modes of Operation

**Demo mode** — no login required. Visitor can describe and generate a form, edit fields, and see a live preview. Cannot publish, embed, or receive submissions. A persistent banner shows runs remaining (3 max) with a signup CTA.

**Authenticated mode** — full product. User can generate, edit, publish, embed, view submissions dashboard, and configure webhooks.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
DEMO_GENERATION_LIMIT=3
```

See `.env.example` for documentation.

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            ← auth guard
│   │   ├── page.tsx              ← forms list
│   │   ├── forms/
│   │   │   ├── new/page.tsx      ← generate + edit flow
│   │   │   └── [id]/
│   │   │       ├── page.tsx      ← edit existing form
│   │   │       ├── embed/page.tsx
│   │   │       └── submissions/page.tsx
│   ├── embed/
│   │   └── [formId]/
│   │       └── route.ts          ← public form renderer (CORS enabled)
│   ├── api/
│   │   ├── generate/route.ts     ← AI form generation
│   │   ├── forms/route.ts        ← CRUD for forms
│   │   ├── submit/[formId]/route.ts
│   │   └── webhook/test/route.ts
│   ├── layout.tsx
│   ├── page.tsx                  ← landing page
│   └── globals.css
├── components/
│   ├── auth/
│   ├── builder/
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── types.ts
│   ├── demo.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── middleware.ts
```

## Database Schema

**profiles** — `id` (uuid, FK auth.users), `email`, `created_at`

**forms** — `id`, `user_id` (FK profiles), `name`, `description`, `fields` (jsonb), `published` (bool), `webhook_url`, `created_at`, `updated_at`
- RLS: users read/write own rows; public read on published forms

**submissions** — `id`, `form_id` (FK forms), `data` (jsonb), `created_at`
- RLS: form owner reads; public insert (for embed)

## Key Architecture Notes

- `/api/generate` calls Claude with a strict JSON-only system prompt — never return prose
- `/embed/[formId]` must return self-contained HTML with inline CSS (no Tailwind, no external deps)
- `/api/submit/[formId]` and `/embed/[formId]` both need `Access-Control-Allow-Origin: *` CORS headers
- Demo rate limiting is per-IP in-memory on the server
- `lib/demo.ts` handles demo session logic (stored in `sessionStorage`)

## Milestones

| # | Milestone |
|---|---|
| M1 | Foundation + Auth |
| M2 | Form Builder |
| M3 | Embed + Submissions |
| M4 | Webhooks + History |
| M5 | Demo Mode + Polish + Ship |

See `issues.md` for full issue breakdown.
