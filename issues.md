# ai-form-builder — GitHub Issues

## Repo name
`ai-form-builder`

## Description
AI-powered form builder. Describe your form in plain English, get a fully
structured form instantly, edit it visually, embed it anywhere with a script
tag or iframe, and receive submissions in your dashboard or via webhook.

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (auth + Postgres)
- Vercel (frontend + API routes)
- Anthropic SDK (@anthropic-ai/sdk)

## Two modes of operation

**Demo mode** — no login required. Visitor can describe and generate a form,
edit fields, and see a live preview. Cannot publish, embed, or receive
submissions. A persistent banner shows runs remaining (3 max) with a signup
CTA.

**Authenticated mode** — full product. User can generate, edit, publish, embed,
view submissions dashboard, and configure webhooks.

---

## Milestones

| Milestone | Due |
|---|---|
| M1 — Foundation + Auth | End of Day 1 |
| M2 — Form Builder | End of Day 2 |
| M3 — Embed + Submissions | End of Day 3 |
| M4 — Webhooks + History | End of Day 4 |
| M5 — Demo Mode + Polish + Ship | End of Day 5 |

---

## Database schema (set up in Supabase before writing code)

**profiles**
| Column | Type | Notes |
|---|---|---|
| id | uuid | references auth.users, primary key |
| email | text | |
| created_at | timestamptz | |

**forms**
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, gen_random_uuid() |
| user_id | uuid | references profiles.id |
| name | text | display name, e.g. "Law Firm Contact Form" |
| description | text | the plain English prompt used to generate it |
| fields | jsonb | array of FormField objects |
| published | boolean | false until user publishes |
| webhook_url | text | nullable, destination for submissions |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: users can only read/write their own rows.
Public read allowed on published forms (needed for embed endpoint).

**submissions**
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, gen_random_uuid() |
| form_id | uuid | references forms.id |
| data | jsonb | { fieldId: value } map |
| created_at | timestamptz | |

RLS: form owner can read submissions for their forms.
Insert allowed from any origin (public, needed for embed submissions).

---

## Folder structure

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
│   │   │       ├── embed/page.tsx ← embed codes + settings
│   │   │       └── submissions/page.tsx
│   ├── embed/
│   │   └── [formId]/
│   │       └── route.ts          ← public form renderer (CORS enabled)
│   ├── api/
│   │   ├── generate/route.ts     ← AI form generation
│   │   ├── forms/route.ts        ← CRUD for forms
│   │   ├── submit/[formId]/route.ts ← public submission endpoint
│   │   └── webhook/test/route.ts ← test a webhook URL
│   ├── layout.tsx
│   ├── page.tsx                  ← landing page
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── builder/
│   │   ├── PromptInput.tsx       ← plain English description input
│   │   ├── FieldList.tsx         ← editable list of fields
│   │   ├── FieldEditor.tsx       ← inline editor for a single field
│   │   └── FormPreview.tsx       ← live rendered preview
│   ├── dashboard/
│   │   ├── FormCard.tsx
│   │   ├── SubmissionTable.tsx
│   │   └── WebhookSettings.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── DemoBanner.tsx
│       └── EmbedCodeBlock.tsx
├── lib/
│   ├── types.ts
│   ├── demo.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── middleware.ts
```

---

## M1 — Foundation + Auth

### #1 — Scaffold project and install dependencies
**Labels:** `setup`
**Milestone:** M1 — Foundation + Auth

Bootstrap Next.js app, configure Tailwind, install dependencies, establish
folder structure with placeholder exports.

**Dependencies:**
```
@supabase/supabase-js
@supabase/ssr
@anthropic-ai/sdk
```

**Acceptance criteria**
- Repo on GitHub, public, description set
- App runs locally on localhost:3000 with no errors
- All dependencies in package.json
- Folder structure matches plan, placeholder exports in all empty files
- Vercel connected and auto-deploying on push

**Commits**
```
chore: initialize Next.js app with TypeScript and Tailwind
chore: install Supabase and Anthropic dependencies
chore: establish folder structure with placeholder exports
```

---

### #2 — Define TypeScript types
**Labels:** `types`
**Milestone:** M1 — Foundation + Auth

Create `lib/types.ts` with every shared interface.

```typescript
// Field types the builder supports
export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "number"
  | "date";

// A single form field definition
export interface FormField {
  id: string;            // nanoid, stable identifier
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];    // for select, radio, checkbox fields
  helpText?: string;
}

// A full form definition
export interface Form {
  id: string;
  user_id: string;
  name: string;
  description: string;
  fields: FormField[];
  published: boolean;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

// A form submission
export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, string | string[] | boolean>;
  created_at: string;
}

// Request to /api/generate
export interface GenerateRequest {
  description: string;
  isDemo?: boolean;
}

// Response from /api/generate
export interface GenerateResponse {
  name: string;          // suggested form name
  fields: FormField[];
}

// Demo session stored in sessionStorage
export interface DemoSession {
  generationsUsed: number;   // max 3
  startedAt: string;
}
```

**Acceptance criteria**
- All types exported, no TypeScript errors
- FieldType union covers all supported input types

**Commits**
```
feat: define all TypeScript interfaces in lib/types.ts
```

---

### #3 — Configure Supabase clients and env vars
**Labels:** `infrastructure`
**Milestone:** M1 — Foundation + Auth

Set up browser and server Supabase clients. Document all env vars.

**lib/supabase/client.ts** — browser client via createBrowserClient.
**lib/supabase/server.ts** — server client via createServerClient with cookie
handling.

**Required env vars:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
DEMO_GENERATION_LIMIT=3
```

**Acceptance criteria**
- Both clients export without errors
- All env vars documented in .env.example
- .env.local created locally with real values

**Commits**
```
feat: configure Supabase browser and server clients
chore: document all required env vars in .env.example
```

---

### #4 — Implement auth and route protection
**Labels:** `auth`
**Milestone:** M1 — Foundation + Auth

Full auth flow using Supabase. Identical pattern to prompt-playground Issue #4
— refer to that implementation for the middleware and form patterns.

**Files to implement:**
- `middleware.ts` — session refresh, redirect unauthenticated users away from
  /(dashboard) routes
- `app/(auth)/login/page.tsx` + `LoginForm.tsx`
- `app/(auth)/signup/page.tsx` + `SignupForm.tsx`
- `app/(dashboard)/layout.tsx` — server-side auth guard

**Acceptance criteria**
- Unauthenticated user visiting /forms/new redirects to /login
- Successful login redirects to dashboard
- Successful signup shows email confirmation message
- Session persists across page refreshes
- Logged-in user visiting /login redirects to dashboard

**Commits**
```
feat: add middleware for session refresh and route protection
feat: add LoginForm and SignupForm with Supabase auth
feat: add dashboard layout with server-side auth guard
```

---

## M2 — Form Builder

### #5 — Build /api/generate route
**Labels:** `api`
**Milestone:** M2 — Form Builder

The AI generation endpoint. Accepts a plain English description, calls Claude,
returns a structured array of FormField objects.

**The prompt strategy:**
Claude must return valid JSON only — no prose, no markdown fences. The system
prompt enforces this strictly. The user message is the form description.

System prompt:
```
You are a form builder assistant. When given a description of a form,
return ONLY a valid JSON object with this exact shape:
{
  "name": "string — a short descriptive form name",
  "fields": [
    {
      "id": "unique_snake_case_id",
      "type": "text|email|phone|textarea|select|checkbox|radio|number|date",
      "label": "string",
      "placeholder": "string or omit",
      "required": true|false,
      "options": ["array", "of", "strings"] or omit,
      "helpText": "string or omit"
    }
  ]
}
Return nothing else. No explanation, no markdown, no code fences.
```

**Demo validation:** if isDemo is true, validate against a server-side
in-memory counter per IP. Return 429 if limit exceeded.

**Acceptance criteria**
- POST with a description returns a valid GenerateResponse
- Response always parses as valid JSON matching GenerateResponse shape
- Malformed Claude output is caught and returns a 500 with a clear message
- Demo requests validated against DEMO_GENERATION_LIMIT
- Returns 400 if description is empty or under 10 characters

**Commits**
```
feat: add /api/generate route with Claude JSON generation
feat: add demo rate limiting to /api/generate
```

---

### #6 — Build PromptInput component
**Labels:** `component`
**Milestone:** M2 — Form Builder

The entry point of the builder flow. A large textarea where the user describes
their form, a Generate button, and example prompts below to help users get
started.

```typescript
interface PromptInputProps {
  onGenerate: (fields: FormField[], name: string) => void;
  isDemo?: boolean;
  demoGenerationsRemaining?: number;
  disabled?: boolean;
}
```

**Example prompts** displayed as clickable pills below the textarea. Clicking
one populates the textarea:
- "Contact form with name, email, and message"
- "Job application with resume upload and experience fields"
- "Event registration with dietary restrictions and t-shirt size"
- "Customer feedback survey with star ratings"

The Generate button shows a loading spinner while the API call is in progress.
On success, calls onGenerate with the returned fields and name.

**Acceptance criteria**
- Textarea accepts multiline input
- Example prompts populate textarea on click
- Generate button disabled when textarea is empty or isLoading
- Loading spinner shows during API call
- Error message shows inline if API returns non-200
- onGenerate fires with parsed fields on success

**Commits**
```
feat: add PromptInput with example prompts and loading state
```

---

### #7 — Build FieldList and FieldEditor components
**Labels:** `component`
**Milestone:** M2 — Form Builder

After generation, the user sees a list of fields they can edit before
publishing.

**FieldList.tsx** — renders a list of FieldEditor components. Has an "Add
field" button at the bottom that appends a blank text field. Supports
drag-to-reorder via the HTML5 Drag and Drop API (no library needed for a
simple list reorder).

```typescript
interface FieldListProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}
```

**FieldEditor.tsx** — inline editor for a single field. Shows:
- Field type dropdown (all FieldType options)
- Label text input
- Placeholder text input (shown for text/email/phone/textarea/number)
- Required toggle
- Options editor (shown for select/radio/checkbox — comma-separated input
  that splits into the options array)
- Help text input (collapsible)
- Delete button

```typescript
interface FieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
  onDelete: () => void;
}
```

**Acceptance criteria**
- Each field renders its editor inline
- Changing field type shows/hides relevant inputs immediately
- Drag handle visible on each field, reorder works via drag and drop
- Add field appends a blank text field with a generated id
- Delete removes the field from the list
- All changes propagate up via onChange immediately

**Commits**
```
feat: add FieldList with drag-to-reorder and add field
feat: add FieldEditor with type-aware input visibility
```

---

### #8 — Build FormPreview component
**Labels:** `component`
**Milestone:** M2 — Form Builder

A live rendered preview of the form as the user edits it. Renders actual HTML
form inputs — not a mockup. The preview updates in real time as fields change
in FieldList.

```typescript
interface FormPreviewProps {
  fields: FormField[];
  name: string;
}
```

Each FieldType renders the correct input:
- `text` / `email` / `phone` / `number` / `date` → `<input type={...}>`
- `textarea` → `<textarea>`
- `select` → `<select>` with `<option>` elements
- `radio` → group of `<input type="radio">` elements
- `checkbox` → `<input type="checkbox">`

The preview is non-interactive — inputs are rendered but the form has no
submit handler. A "Preview only" label makes this clear.

Style the preview to look like a clean, neutral form that would work on any
client's website — white background, subtle borders, standard spacing.

**Acceptance criteria**
- All field types render the correct HTML input
- Required fields show a red asterisk next to the label
- Help text renders below the input in muted style
- Preview updates immediately when fields change
- Select/radio/checkbox options render from the options array
- Empty options array for select/radio/checkbox renders a placeholder message

**Commits**
```
feat: add FormPreview with live field rendering
```

---

### #9 — Assemble form builder page
**Labels:** `integration`
**Milestone:** M2 — Form Builder

Compose the full builder flow in `app/(dashboard)/forms/new/page.tsx`.

**Three states the page moves through:**
1. **Empty** — PromptInput centered on page, no fields yet
2. **Generated** — PromptInput collapsed to top, FieldList left, FormPreview
   right, Save Draft and Publish buttons in the header
3. **Saved** — redirect to /forms/[id] with success toast

**State to manage:**
```typescript
const [formName, setFormName] = useState("");
const [fields, setFields] = useState<FormField[]>([]);
const [description, setDescription] = useState("");
const [isGenerating, setIsGenerating] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [phase, setPhase] = useState<"empty" | "generated">("empty");
```

**Save Draft** — POSTs to /api/forms with published:false. Redirects to
/forms/[id] on success.

**Publish** — POSTs to /api/forms with published:true. Redirects to
/forms/[id]/embed on success so the user immediately sees their embed codes.

**Acceptance criteria**
- Page starts in empty state showing only PromptInput
- After generation, transitions to split layout
- FieldList and FormPreview stay in sync as user edits
- Save Draft saves and redirects to edit page
- Publish saves and redirects to embed page
- Regenerate button in header re-runs generation with same description

**Commits**
```
feat: assemble form builder page with three-phase flow
```

---

## M3 — Embed + Submissions

### #10 — Build /api/forms CRUD route
**Labels:** `api`
**Milestone:** M3 — Embed + Submissions

Standard CRUD for forms. All routes require auth.

- `GET /api/forms` — returns all forms for the authenticated user
- `POST /api/forms` — creates a new form, returns the created form with id
- `GET /api/forms/[id]` — returns a single form
- `PUT /api/forms/[id]` — updates fields, name, webhook_url, published status
- `DELETE /api/forms/[id]` — deletes form and all its submissions

**Acceptance criteria**
- All five operations work correctly
- Returns 401 if session is invalid
- Returns 404 if form doesn't belong to the authenticated user
- PUT correctly updates the updated_at timestamp
- DELETE cascades to submissions

**Commits**
```
feat: add /api/forms CRUD route with auth validation
```

---

### #11 — Build public embed endpoint and submission route
**Labels:** `api`
**Milestone:** M3 — Embed + Submissions

Two public routes — no auth required.

**app/embed/[formId]/route.ts** — returns a self-contained HTML page that
renders the form. This is what the iframe src points to. Must include:
- CORS headers: `Access-Control-Allow-Origin: *`
- The form rendered as plain HTML with inline CSS (no Tailwind, no external
  dependencies — must work on any client site)
- A script that POSTs submissions to /api/submit/[formId]
- A success message that replaces the form on submission

**app/api/submit/[formId]/route.ts** — accepts POST with form data, validates
required fields, saves to Supabase submissions table, fires webhook if
configured.

CORS headers required on submit route too — the embed iframe submits
cross-origin.

**Acceptance criteria**
- /embed/[formId] returns a valid HTML page with the form rendered
- Form submits correctly from within an iframe on a different domain
- Submission is saved to Supabase
- Required field validation returns 400 with field-level error messages
- Webhook fires after successful save if webhook_url is configured
- /embed/[formId] returns 404 if form is not published

**Commits**
```
feat: add public embed HTML route with CORS headers
feat: add /api/submit route with validation and webhook firing
```

---

### #12 — Build EmbedCodeBlock component and embed page
**Labels:** `feature`
**Milestone:** M3 — Embed + Submissions

After publishing, the user lands on /forms/[id]/embed. This page shows their
embed codes and lets them configure the webhook.

**components/shared/EmbedCodeBlock.tsx** — displays a code block with a copy
button. Used twice on the embed page — once for the script tag, once for the
iframe.

**Script tag embed:**
```html
<script src="https://yourapp.com/embed/[formId]/widget.js"></script>
<div id="ai-form-[formId]"></div>
```

**iFrame embed:**
```html
<iframe
  src="https://yourapp.com/embed/[formId]"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

Note: the script tag widget approach requires a separate widget.js route that
injects the iframe dynamically. Implement iframe first, add script tag as a
stretch goal if time allows.

**Acceptance criteria**
- Both embed codes display with syntax highlighting (use a `<pre>` tag, no
  library needed)
- Copy button copies to clipboard and shows "Copied!" for 2 seconds
- Webhook URL input saves on blur
- Test Webhook button fires a sample POST to the configured URL and shows
  success/failure
- Link to submissions page

**Commits**
```
feat: add embed page with copy-to-clipboard code blocks
feat: add webhook URL input with test button
```

---

## M4 — Webhooks + History

### #13 — Build submissions dashboard
**Labels:** `feature`
**Milestone:** M4 — Webhooks + History

app/(dashboard)/forms/[id]/submissions/page.tsx — server component. Fetches
all submissions for the form and renders them in a table.

**components/dashboard/SubmissionTable.tsx** — table with one row per
submission. Columns are generated dynamically from the form's field labels.
Rows show submitted values for each column. Sortable by submitted_at.
CSV export button downloads all submissions as a file.

**Acceptance criteria**
- Table columns match the form's field labels
- All submissions render with correct values
- Submitted_at column shows formatted timestamp
- CSV export downloads correctly and opens in Excel/Google Sheets
- Empty state shows when no submissions yet
- Page is a Server Component

**Commits**
```
feat: add submissions dashboard with dynamic columns
feat: add CSV export for submissions
```

---

### #14 — Build forms list dashboard
**Labels:** `feature`
**Milestone:** M4 — Webhooks + History

app/(dashboard)/page.tsx — the main dashboard. Server component. Shows all
the user's forms as cards.

**components/dashboard/FormCard.tsx** — shows form name, published status
badge, submission count, created date, and links to edit, embed, and
submissions pages.

**Acceptance criteria**
- All user forms render as cards
- Published badge shows green for published, gray for draft
- Submission count accurate
- Links to edit/embed/submissions all work
- Empty state with CTA to create first form
- "New Form" button in header

**Commits**
```
feat: add forms list dashboard with FormCard components
```

---

## M5 — Demo Mode + Polish + Ship

### #15 — Build landing page and demo mode
**Labels:** `feature`
**Milestone:** M5 — Demo Mode + Polish + Ship

Identical pattern to prompt-playground Issue #13. Landing page with "Try Demo"
and "Sign Up" CTAs. Demo session in sessionStorage. DemoBanner throughout.

**Demo restrictions:**
- 3 generations max per session
- Can generate and edit forms
- FormPreview works fully
- Save Draft, Publish, and embed codes are disabled/hidden
- A "Sign up to publish and embed" message replaces the publish button

**lib/demo.ts** — shared demo session logic. Same pattern as prompt-playground.

**Acceptance criteria**
- Landing page renders with both CTAs
- Demo session created on "Try Demo" click
- DemoBanner shows generations remaining
- Publish button replaced with signup CTA in demo mode
- After 3 generations, PromptInput is disabled with upgrade message

**Commits**
```
feat: add landing page with demo and signup CTAs
feat: add demo session logic and DemoBanner
```

---

### #16 — Polish pass
**Labels:** `polish`
**Milestone:** M5 — Demo Mode + Polish + Ship

Loading states, error handling, empty states, responsive layout, page titles,
favicon.

**Acceptance criteria**
- No layout shift during generation
- Error toast if /api/generate returns non-200
- All pages have correct titles
- Console clean in production build
- Mobile layout not broken

**Commits**
```
fix: add loading states and error handling throughout
chore: set page titles and favicon
```

---

### #18 — Logout and dashboard header
**Labels:** `feature`
**Milestone:** M5 — Demo Mode + Polish + Ship

The dashboard has no persistent header and no way to log out. `Header.tsx`
is currently an empty stub. Implement it and wire it into the dashboard
layout.

**Header.tsx** — server component. Shows the app name ("Formby") on the
left and the logged-in user's email + a Sign Out button on the right.
Sign Out calls Supabase `signOut()` via a small client action and redirects
to `/login`.

**app/(dashboard)/layout.tsx** — import and render `<Header />` above
`{children}` so it appears on every dashboard page.

**Acceptance criteria**
- Header visible on all dashboard pages (forms list, edit, embed, submissions)
- App name links to `/`
- User email displayed
- Sign Out button signs the user out and redirects to `/login`
- Header does not appear on `/login` or `/signup`

**Commits**
```
feat: add dashboard header with logout
```

---

### #19 — Form edit page
**Labels:** `feature`
**Milestone:** M5 — Demo Mode + Polish + Ship

`app/(dashboard)/forms/[id]/page.tsx` currently returns `null`. It should
load the existing form and render the full builder UI pre-populated with
the saved fields, allowing the user to edit and save changes.

**Behaviour:**
- Server component fetches the form via Supabase; calls `notFound()` if
  missing or not owned by the user
- Renders a client component (`EditFormPage`) that mirrors the `generated`
  phase of `forms/new/page.tsx` — header with form name input, FieldList
  left, FormPreview right
- Save button PUTs to `/api/forms/[id]` with updated name, fields,
  description, and published status
- Publish/Unpublish toggle — if form is a draft the button says "Publish";
  if already published it says "Unpublish"
- Redirect to `/forms/[id]/embed` after publishing; stay on page after
  saving a draft (show a transient "Saved" confirmation)
- Back link to `/` (forms list)

**Acceptance criteria**
- Page loads with existing fields and name populated
- All edits (field add/remove/reorder/edit, name change) are saveable
- Publish/Unpublish toggle works and reflects current state
- Save shows inline confirmation; publish redirects to embed page
- `notFound()` called for unknown or unowned form IDs
- `generateMetadata` sets title to form name

**Commits**
```
feat: implement form edit page
```

---

### #20 — Delete form from dashboard
**Labels:** `feature`
**Milestone:** M5 — Demo Mode + Polish + Ship

There is no way to delete a form. Add a Delete button to `FormCard` that
calls `DELETE /api/forms/[id]` and removes the card from the list without
a full page reload.

**FormCard** needs to become a client component (or extract a thin client
wrapper) to handle the delete interaction. Show a confirmation before
deleting ("Delete this form and all its submissions?"). Optimistically
remove the card on confirm; restore it if the API call fails.

**Acceptance criteria**
- Delete button visible on each FormCard
- Confirmation prompt shown before deletion
- Card removed from list immediately on confirm
- Error shown and card restored if DELETE fails
- DELETE `/api/forms/[id]` already implemented (M3); no API changes needed

**Commits**
```
feat: add delete form button to FormCard
```

---

### #17 — Write README and deploy to production
**Labels:** `docs`
**Milestone:** M5 — Demo Mode + Polish + Ship

README covers what it is, how it works, local setup, env var documentation,
embed documentation for end users, and demo mode instructions.

**Production env vars:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
DEMO_GENERATION_LIMIT=3
```

**Acceptance criteria**
- README renders cleanly on GitHub
- Production URL live on Vercel
- All env vars set in Vercel dashboard
- Demo mode works on production URL
- Embed tested on a real external page (can be a simple HTML file)
- Loom demo recorded — show generation, editing, publishing, and embed in action
- All issues closed, all milestones marked complete

**Commits**
```
docs: add README with setup, embed docs, and project context
chore: configure all production environment variables
```
