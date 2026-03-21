# Formby

> AI-powered form builder. Describe what you need in plain English — Formby generates the fields, types, and order instantly. Publish, embed anywhere, and receive submissions in your dashboard or via webhook.

Built with Claude as the generation engine. No drag-and-drop marathons, no template browsing — just describe the form and go.

---

## Features

- **AI generation** — Claude produces correct field types, sensible ordering, and real labels from a plain English description. Rarely needs manual fixes.
- **Visual editor** — Drag to reorder, change field types, edit labels and options, see a live preview side-by-side.
- **Embed anywhere** — One `<iframe>` or `<script>` tag. Works on any site. Self-contained HTML with no external dependencies.
- **Submissions dashboard** — Every response captured and stored. Sort, read individual entries, export to CSV.
- **Webhook delivery** — Route submissions to Zapier, Slack, Notion, or any endpoint automatically.
- **Demo mode** — 3 free AI generations, no account required. Good for portfolio visitors who want to try it.
- **BYOK** — Authenticated users supply their own Anthropic API key. Nothing stored server-side.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase (Postgres + RLS) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm i -g pnpm`)
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/southwestmogrown/formby.git
cd formby

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values (see Environment Variables below)

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=        # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=       # From Supabase project settings
ANTHROPIC_API_KEY=               # Used for demo mode only (3 free generations)
DEMO_GENERATION_LIMIT=3
```

### Database Setup

Run the following in your Supabase SQL editor:

```sql
-- Profiles
create table profiles (
  id uuid references auth.users primary key,
  email text,
  created_at timestamptz default now()
);

-- Forms
create table forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  fields jsonb not null default '[]',
  published boolean not null default false,
  webhook_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Submissions
create table submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references forms(id) on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- RLS
alter table forms enable row level security;
create policy "Users manage their own forms" on forms for all using (auth.uid() = user_id);
create policy "Public can read published forms" on forms for select using (published = true);

alter table submissions enable row level security;
create policy "Form owners can read submissions" on submissions for select
  using (exists (select 1 from forms where forms.id = submissions.form_id and forms.user_id = auth.uid()));
create policy "Public can submit to published forms" on submissions for insert
  with check (exists (select 1 from forms where forms.id = submissions.form_id and forms.published = true));
```

---

## Usage

1. **Try the demo** at `/demo` — no account needed, 3 free generations
2. **Sign up** and add your Anthropic API key in the dashboard banner
3. **Create a form** — describe it, generate, tweak fields if needed
4. **Publish** — grab the embed code from the Embed page
5. **Paste** the `<iframe>` or `<script>` tag into any site
6. **View submissions** in your dashboard or pipe them to a webhook

---

## Architecture

The app runs in two modes. **Demo** hits `/api/generate` with the server's Anthropic key, rate-limited per IP (in-memory, resets on cold start). **Authenticated** users pass their own API key client-side — it's forwarded per-request and never stored.

`/embed/[formId]` returns fully self-contained HTML with inline CSS and a vanilla JS submit handler — no framework, no CDN, embeds anywhere.

```
src/
├── app/
│   ├── (auth)/          # Login + signup (modal-style pages)
│   ├── (dashboard)/     # Auth-guarded: forms list, builder, submissions
│   ├── demo/            # Public demo page
│   ├── embed/[formId]/  # Self-contained form HTML (CORS enabled)
│   └── api/             # generate, forms CRUD, submit, webhook
├── components/
│   ├── builder/         # PromptInput, FieldList, FieldEditor, FormPreview
│   ├── dashboard/       # FormCard, SubmissionTable, DeleteFormButton
│   └── shared/          # Header, ApiKeyBanner, DemoBanner, EmbedCodeBlock
└── lib/                 # types, demo helpers, apiKey helpers, supabase clients
```

---

## Deployment

Deploy to Vercel in one step — framework is auto-detected. Add the five environment variables from above, then add your production URL to Supabase under **Authentication → URL Configuration → Redirect URLs**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Dev Commands

```bash
pnpm dev          # Dev server on localhost:3000
pnpm build        # Production build
pnpm test         # Vitest test suite (172 tests)
pnpm lint         # ESLint
pnpm type-check   # tsc --noEmit
```

---

## License

MIT
