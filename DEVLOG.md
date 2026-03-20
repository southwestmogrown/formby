# DEVLOG — formby AI Form Builder

Branch: `claude/init-project-config-Pnpm4`

---

## M1 — Foundation + Auth

### What was built
- Scaffolded Next.js 15 app with TypeScript, Tailwind v4, ESLint
- Installed Supabase SSR, Anthropic SDK, testing deps (Vitest, Playwright, Testing Library)
- Defined all TypeScript interfaces in `src/lib/types.ts` (`FormField`, `Form`, `Submission`, etc.)
- Configured Supabase browser and server clients with cookie-aware SSR pattern
- Implemented middleware for session refresh and route protection
- Built `LoginForm` and `SignupForm` with Supabase auth
- Added dashboard layout with server-side auth guard (`notFound()` / redirect)
- Set up GitHub Actions CI: lint → type-check → unit tests → build

### Bugs caught and fixed post-M1
- **Middleware broken**: file was named `proxy.ts` and exported `proxy` — Next.js requires `middleware.ts` with export named `middleware`. Auth protection was silently never running.
- **Route conflict**: boilerplate `src/app/page.tsx` conflicted with `src/app/(dashboard)/page.tsx` at the same `/` URL, causing Next.js build failure.
- **Vitest path alias**: `@/*` alias was not configured in `vitest.config.ts`, causing all test imports to fail.
- **afterEach cleanup**: `cleanup` from React Testing Library was not registered, causing DOM to accumulate between tests.

### Test count at M1 completion
112 tests across 8 test files.

---

## M2 — Form Builder

### What was built
- `src/app/api/generate/route.ts` — calls Claude (claude-sonnet-4-6), validates JSON shape, demo rate limiting per IP (increments only on success)
- `src/components/builder/PromptInput.tsx` — four clickable example prompt pills, 10-char minimum to enable Generate, loading state, error display, `isDemo` / `demoGenerationsRemaining` props
- `src/components/builder/FieldEditor.tsx` — type dropdown, label input, required checkbox, placeholder (for text/email/phone/textarea/number), options (for select/radio/checkbox as comma-separated), collapsible help text
- `src/components/builder/FieldList.tsx` — HTML5 drag-and-drop reorder with drag handle (not whole card), reorder committed on `drop` only (not `dragover`)
- `src/components/builder/FormPreview.tsx` — all 9 field types rendered as read-only HTML, checkbox group vs single checkbox, required asterisk, empty options placeholder
- `src/app/(dashboard)/forms/new/page.tsx` — three-phase flow: empty → generated → redirect; `initialDescription` prop on PromptInput for Regenerate flow; Save/Publish calls `POST /api/forms`
- `src/app/api/forms/route.ts` — GET (list user's forms) + POST (create form), both auth-gated

### Key bugs caught in review
- **Drag-and-drop loop**: original committed reorder on `dragover` (fires hundreds of times per drag). Fixed to commit only on `drop`.
- **Draggable on whole card**: text inputs inside FieldEditor were being dragged instead of typing. Fixed to put `draggable` only on the handle element.
- **Demo counter burned on failure**: counter incremented before API response. Fixed to increment only after successful generation.
- **Generate button threshold**: was checking `> 0` chars. Fixed to `>= 10` to match API validation.
- **Checkbox options ignored**: single checkbox was rendered even when an options array was present. Fixed to render as checkbox group.
- **Help text not collapsible**: was always visible. Added "+ Add help text" toggle button pattern.
- **Regenerate lost description**: PromptInput managed description internally so the page couldn't restore it. Fixed with `initialDescription` prop.

### Process feedback (from user)
> "Each of those features should have had an agent, and each feature reviewed. The context on that session had to have been enormous. Don't do that again. Always break tasks down and use agents when you can. One review agent per issue. Main thread only orchestrates. Tests built along the way."

**This feedback changed all subsequent work**: M3 and beyond use one implementation agent + one review agent per issue, with the main thread only orchestrating.

### Test count at M2 completion
112 tests across 8 test files (M2 features tested inline during build).

---

## M3 — Embed + Submissions

### Orchestration model (strictly followed)
- Main thread: orchestrates only, never writes code
- One implementation agent per issue
- One review agent per issue (blocks merge until PASS)
- Tests written alongside features in each implementation agent

### Issue #10 — `GET/PUT/DELETE /api/forms/[id]`

**Implemented:** `src/app/api/forms/[id]/route.ts`
- GET: auth-gated, returns 404 via RLS if not owner or not found
- PUT: auth-gated, parses JSON body with try/catch, includes `updated_at`, accepts partial updates
- DELETE: auth-gated, returns `new Response(null, { status: 204 })`
- All handlers await `params` (Next.js 16 async params requirement)
- No `user_id` filter — RLS handles ownership

**Tests:** `src/app/api/forms/__tests__/[id]/route.test.ts` — 10 tests (GET: 200/401/404; PUT: 200/401/404/updated_at/partial; DELETE: 204/401)

**Review:** PASS first pass.

**Commit:** `feat: add /api/forms/[id] GET PUT DELETE with auth and tests`

### Issue #11 — Public embed HTML + submit API

**Implemented:** `src/app/embed/[formId]/route.ts` + `src/app/api/submit/[formId]/route.ts`

Embed route:
- Public (no auth), CORS headers on every response
- Queries with `.eq('published', true)` — unpublished forms return 404
- Returns fully self-contained HTML (no external CSS/JS deps)
- Inline `<script>` intercepts form submit, POSTs JSON to `/api/submit/{formId}`, shows Thank You or inline error
- All user-provided text HTML-escaped to prevent XSS

Submit route:
- Public, CORS on all responses, OPTIONS handler
- Validates required fields (empty string = missing)
- Returns 400 `{ error, fields: ['Label1', ...] }` for missing required fields
- Inserts to `submissions` table
- Fire-and-forget webhook: `fetch(...).catch(() => {})` — not awaited

**Tests:** 7 embed tests + 8 submit tests (including webhook-failure-still-returns-201 test)

**Review:** PASS first pass.

**Commit:** `feat: add public embed HTML route and submit API with CORS and webhook`

### Issue #12 — EmbedCodeBlock + WebhookSettings + embed page

**Implemented:**
- `src/components/shared/EmbedCodeBlock.tsx` — two code blocks (iframe + script tag), per-section copy with `navigator.clipboard.writeText`, "Copied!" feedback resets after 2s, SSR-safe URL via `window.location.origin` guard
- `src/components/dashboard/WebhookSettings.tsx` — webhook URL input, Save (PUT `/api/forms/[id]`) + Test (POST `/api/webhook/test`), independent save/test status states, all fetch calls in try/catch
- `src/app/(dashboard)/forms/[id]/embed/page.tsx` — server component, awaits params, uses `notFound()`, delegates to `EmbedPageContent`
- `src/app/(dashboard)/forms/[id]/embed/EmbedPageContent.tsx` — client wrapper (needed because server components cannot pass callback functions to client components), manages `onSave` locally, shows unpublished warning

**Tests:** 7 EmbedCodeBlock tests + 10 WebhookSettings tests

**Test fix required:** The agent used `vi.stubGlobal('navigator', ...)` which replaced the entire navigator object, breaking `userEvent` internally. Fixed by using `Object.defineProperty(navigator, 'clipboard', ...)` instead. Also switched from `userEvent.click()` to `fireEvent.click()` + `act(async () => {})` to properly flush the async clipboard handler state update.

**Review:** PASS.

**Commit:** `feat: add EmbedCodeBlock, WebhookSettings, and embed dashboard page`

### Final gate
- `pnpm lint` — no errors
- `pnpm type-check` — no errors
- `pnpm test` — 155 tests, 13 test files, all passing

### Test count at M3 completion
155 tests across 13 test files.

---

## Summary

| Milestone | Tests | Key files |
|-----------|-------|-----------|
| M1 | 112 | middleware, auth forms, dashboard layout, CI |
| M2 | 112 | generate API, form builder UI, forms CRUD |
| M3 | 155 | forms/[id] CRUD, embed HTML, submit API, embed page UI |

### Patterns established
- Auth: `createClient()` → `getUser()` → 401 if null; no `user_id` filter (RLS handles ownership)
- Errors: always `{ error: 'message' }` JSON
- Public routes: CORS headers on every response branch (not only OPTIONS), export `OPTIONS` returning 204
- Next.js 16 async params: always `await params` before reading route params
- Fire-and-forget: `fetch(...).catch(() => {})` — not awaited, `.catch` chained directly
- Vitest mocks: `vi.hoisted()` for all mocks; imports after `vi.mock()` calls
- Controlled input tests: use stateful wrapper components (`renderStateful`) or `fireEvent.change` for single-shot value setting
- Fake timers + async state: use `fireEvent` + `act(async () => {})` rather than `userEvent` with `advanceTimers`
