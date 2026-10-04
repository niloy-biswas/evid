# AGENTS.md: Evid

Orientation for coding agents. Read **Find it fast** and **Where new code goes** before searching or adding files; the codebase is large enough that guessing a location usually lands on the wrong layer.

Product brand: **Evid** (`lib/brand.ts`: name, tagline, `supportEmail`, `githubUrl`, `marketingPrimaryCta`, `contactMailto`, optional `demoBookingUrl` via `NEXT_PUBLIC_DEMO_BOOKING_URL`). `/book-demo` uses the Powder hero sky; Google Appointment links open via button (cannot iframe); Cal.com/Calendly can embed. Shared mark: **`components/brand-mark.tsx`**. Public marketing at **`/`**; demo booking at **`/book-demo`**; authenticated product home at **`/app`**.

License: **Elastic License 2.0** (`LICENSE`); source-available, not OSI open source. Do not describe Evid as "open source" in copy.

## What this is

Next.js app: **published** BI dashboards (`dashboards`), **per-dashboard chat** (`chat_sessions` / `chat_messages`), a **LangGraph** analytics agent against **BigQuery**, optional **share-by-link**. The **admin workspace** (`/admin`) lets editors and admins manage dashboard lifecycle, context (rules, caveats, instructions, example questions, table allowlist), org analytics defaults (`/admin/settings/workspace`), data sources, AI provider settings, and the signup email domain without hand-editing SQL.

## Stack

- **Framework:** Next.js **16** (App Router), React 19, TypeScript strict.
- **UI:** Tailwind 4, shadcn-style primitives (`components/ui/`), Framer Motion, react-markdown, Recharts.
- **Auth:** Supabase Auth (email/password + Google). The **allowed email domain** comes from `app_settings` (admin: `/admin/settings/auth`), with **`ALLOWED_EMAIL_DOMAIN`** env as bootstrap fallback; `*` allows any domain. Google sign-in passes an OAuth **`hd`** hint when the domain is not `*` (`lib/auth/allowed-email-domain.ts`). SSR: `@supabase/ssr`.
- **Data:** Supabase Postgres: app catalog, chat, `app_settings`, `data_sources`, encrypted credentials and keys.
- **Warehouse:** **BigQuery** via LangChain tools. Credentials: the dashboard's **`data_sources`** row when `dashboards.data_source_id` is set, else the most recently updated admin-connected BigQuery source, else env **`BIGQUERY_PROJECT`** + **`GOOGLE_APPLICATION_CREDENTIALS_JSON`**. Chat requires explicit service-account JSON (no ADC).
- **Agent:** LangGraph / LangChain under `lib/application/`, streamed from **`POST /api/chat`**.

## Folder layout

```text
app/                    Routes only: page.tsx / layout.tsx / route.ts + server-side data loading.
                        No reusable UI lives here; pages render a component from components/.
  api/admin/**          Admin JSON API (role-checked)
  api/chat/*, api/sessions/*, api/public/*
components/
  ui/                   shadcn-style primitives only (button, card, chart, input, textarea, native-select)
  icons/                Third-party brand icons (Google, GitHub)
  admin/                Admin shell + admin-form.tsx (AdminPageHeader, Field, FormError, FormSuccess)
    dashboards/         Registry, editor, dashboard-status.ts (publish/unpublish/archive call)
    settings/           auth / data-sources / models / workspace settings screens
    users/              Users management screen
  chat/                 Chat screen, shared (read-only) view, message bubble, charts, tool-call UI
  dashboard/            Dashboard selector screen + sidebar
  marketing/            Landing page sections, demo data, copy config, motion hooks
  legal/                Privacy / terms shell
  brand-mark.tsx, theme-provider.tsx, theme-toggle.tsx   (app-wide)
hooks/                  Cross-feature client hooks (use-chat.ts)
lib/
  api/                  route-response.ts (server: handleRouteError, jsonError), read-api-error.ts (client: apiErrorMessage)
  application/          Chat agent (see "Agent layers" below)
  admin/                Server helpers for admin APIs: connection tests, provider model catalogs
  auth/                 Session + role checks, allowed-email-domain logic
  secrets/              AES-GCM encryption for stored keys/credentials
  supabase/             ALL database access: queries.ts (app), admin-queries.ts (service role), clients
  theme/tokens.ts       Reads CSS color tokens at runtime (chart export)
  env.ts                Shared server env fallbacks (MODEL_PROVIDER, provider keys/models, BigQuery, email domain)
  chat-parts.ts         Client-safe stream/parts helpers shared by use-chat.ts and the chat orchestrator
  brand.ts, types.ts, utils.ts
supabase/               migrations/ (apply in order), seeds/
scripts/check-tokens.mjs  Color-literal guard (has a path ALLOWLIST; update it when moving allowlisted files)
```

### Agent layers (`lib/application/`)

```text
app/api/chat/route.ts
  → runtime/resolve-chat-runtime.ts     provider, API key, model, BigQuery creds (settings → env)
  → orchestrators/chat-orchestrator.ts  streamAgentResponse: stream wire format, Opik callbacks
    → agents/analytics-agent.ts         createReactAgent(llm, tools, prompt)
      → llm/providers.ts                createLLM per provider (Anthropic / OpenAI / OpenRouter)
      → tools/bigquery-tools.ts         execute_query, list_tables, describe_table
      → prompts/analytics-prompt.ts     system prompt (dashboard + workspace context)
    → tracing/opik.ts
llm/model-names.ts                      ModelProvider enum, MODEL_PROVIDERS, labels, seed model lists, validators (client-safe)
runtime/llm-api-key-from-settings.ts    resolveLlmApiKey(provider, pasted?) = pasted → stored (encrypted) → env
runtime/llm-model-from-settings.ts      stored model per provider
runtime/workspace-analytics.ts          org defaults from app_settings
```

## Find it fast

| I need to... | Look in |
|---|---|
| Change a page's UI | The component the route renders, under `components/<domain>/` (open the route's `page.tsx` to see which) |
| Change what a page loads server-side, or its auth gate | `app/**/page.tsx` / `layout.tsx` (`app/admin/layout.tsx` = editor+admin, `app/admin/settings/layout.tsx` = admin only) |
| Add/modify an admin API | `app/api/admin/**/route.ts`; DB calls in `lib/supabase/admin-queries.ts`; roles via `lib/auth/require-role.ts` |
| Change chat streaming / agent behavior | `lib/application/orchestrators/chat-orchestrator.ts`, `agents/analytics-agent.ts` |
| Change the system prompt | `lib/application/prompts/analytics-prompt.ts` |
| Add a BigQuery tool | `lib/application/tools/bigquery-tools.ts` |
| Add or change an LLM provider or model list | `lib/application/llm/model-names.ts`, `llm/providers.ts`, `lib/admin/provider-models.ts` (catalog), `lib/admin/test-connections.ts` (ping), `components/admin/settings/models-settings.tsx` |
| Change how provider/key/model/BigQuery is chosen at runtime | `lib/application/runtime/resolve-chat-runtime.ts` + `lib/env.ts` |
| Read a new server env var | `lib/env.ts` (if more than one module needs it); add it to `.env.example` |
| Change a DB query | `lib/supabase/queries.ts` (anon client) or `admin-queries.ts` (service role). Do not query Supabase from components or routes directly |
| Add/change a shared type | `lib/types.ts` (`UserRole`, `DashboardStatus`, `Dashboard`, `ChatPayload`, ...). Admin row types live next to their queries in `admin-queries.ts`; import them with `import type` from client code |
| Chat message rendering, charts, SQL blocks | `components/chat/chat-message.tsx`, `chart-block.tsx`, `tool-call-block.tsx`, `highlighted-code.tsx` |
| Client chat state + `/api/chat` streaming | `hooks/use-chat.ts` |
| Shared/read-only session page | `app/share/[token]/page.tsx` → `getSharedChatByToken` in `lib/supabase/queries.ts` → `components/chat/shared-chat-view.tsx` |
| Landing page copy / demo data | `components/marketing/config.ts`, `demo-data.ts` |
| Colors / theme tokens | `app/styles/palette.css` (hex) → `semantic.css` / `marketing-powder.css` (roles) |
| Auth redirects / public paths | `proxy.ts` (`PUBLIC_PATHS`), OAuth callback `app/auth/callback/route.ts` |
| Brand name, URLs, CTAs | `lib/brand.ts` |
| Schema | `supabase/migrations/*.sql` |

Search tips: route URLs map 1:1 to folders under `app/` (dynamic segments in brackets, e.g. `app/api/admin/settings/models/[provider]/refresh/route.ts`). Component names are PascalCase of the file name (`dashboard-editor.tsx` → `DashboardEditor`). Admin DB functions are prefixed `admin*`.

## Where new code goes

- **New page:** route file in `app/`, UI in `components/<domain>/`. A `"use client"` screen never lives in `app/`.
- **New admin settings screen:** `components/admin/settings/<name>-settings.tsx` + a thin `app/admin/settings/<name>/page.tsx` + nav entry and title in `components/admin/admin-layout-shell.tsx`.
- **Admin forms:** use `Input` / `Textarea` / `NativeSelect` from `components/ui/`, and `AdminPageHeader`, `Field`, `FormError`, `FormSuccess` from `components/admin/admin-form.tsx`. Do not paste raw input class strings or banner markup.
- **New API route:** wrap the body in `try { ... } catch (e) { return handleRouteError(e, "Failed to ...") }`; return early errors with `jsonError(message, status)`. Error bodies are always `{ error: string }`. On the client, read them with `apiErrorMessage(data, fallback)`.
- **Validation:** Zod schemas in the route file; optional text fields go through `emptyToNull` (`lib/utils.ts`).
- **DB access:** add a function to `lib/supabase/queries.ts` or `admin-queries.ts`; never call `supabase.from(...)` from components.
- **Hooks:** feature-only hooks stay with the feature (`components/marketing/use-reduced-motion.ts`); cross-feature hooks go in `hooks/`.
- **Single-owner env vars** stay with their owner: `SETTINGS_*` (`lib/secrets`), `SUPABASE_SERVICE_ROLE_KEY` (`lib/supabase/admin-client.ts`), `ADMIN_EMAIL` (`lib/supabase/bootstrap-admin.ts`), `OPIK_*` (`lib/application/tracing`). `NEXT_PUBLIC_*` must be read literally where used so Next inlines them.

## Env

See **`.env.example`**. Highlights:

- Supabase: `NEXT_PUBLIC_SUPABASE_*`, **`SUPABASE_SERVICE_ROLE_KEY`** (server; admin APIs + encrypted field access).
- **`SETTINGS_ENCRYPTION_KEY`**: required to store encrypted AI keys and BigQuery JSON from the admin UI.
- **`SETTINGS_KDF_SALT`**: optional; only needed to decrypt secrets encrypted with a previous salt.
- **`ADMIN_EMAIL`**: optional first-boot admin promotion when the service role is available.
- **`ALLOWED_EMAIL_DOMAIN`**: optional until overridden in the DB via admin settings.
- LLM: `MODEL_PROVIDER`, provider API keys, optional `*_DEFAULT_MODEL` (admin UI overrides at runtime).
- BigQuery **fallback** when no data source applies: `BIGQUERY_PROJECT`, `BIGQUERY_LOCATION`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`.
- Optional: Opik tracing keys (`OPIK_*`).

## Auth edge handler

Root **`proxy.ts`** refreshes Supabase session cookies, redirects unauthenticated users to `/login` (except **`/`**, **`/book-demo`**, **`/privacy`**, **`/terms`**, **`/robots.txt`**, **`/sitemap.xml`**, **`/opengraph-image`**, **`/auth/*`**, **`/api/public/*`**, login/signup; extend `PUBLIC_PATHS` for new public pages), and skips **`/auth/*`** so OAuth PKCE cookies are not corrupted before `app/auth/callback/route.ts`. Logged-in users on auth pages redirect to **`/app`**, or to `?next=` when it is a same-origin path. Every post-login redirect (proxy, OAuth callback, login and signup pages, the links between them) goes through `safeNextPath` / `withNextParam` in `lib/auth/next-path.ts`.

> If production ever shows **no redirects** while logged out, confirm Next's expected **`middleware`** export for your deployment; this repo uses **`proxy.ts`** as the session edge entry.

## Important domain rules

- **`dashboards.id`**: UUID PK (URLs `/chat/[dashboardId]`, FKs on `chat_messages`, `chat_sessions`).
- **`dashboards.dashboard_id`**: human-facing code (`G107`, ...). **`dashboard_tables.dashboard_id`** is this **text** column, **not** the UUID (admin table mapping must use the short code).
- **`session_id` in payloads**: UUID = **`chat_sessions.id`**. **`session_number`**: incremental per user + dashboard for pretty URLs.
- Chat serves **published** dashboards only (`getPublishedDashboardById`).

## SQL migrations and seeds

For a fresh database, apply numbered files in order under **`supabase/migrations/`** (see **`PLAN.md`**):

```text
000_current_schema.sql
001_admin_workspace.sql
002_admin_top_dashboards_by_messages.sql
003_workspace_analytics_settings.sql
004_workspace_org_profile.sql
005_rls_hotfix.sql
006_rls_owner_scoped_chat.sql   (apply only after the app uses the signed-in client; see file header)
007_shared_chat_lookup.sql      (additive; apply before deploying the get_shared_chat caller)
008_drop_shared_read_policies.sql (apply after that deploy)
```

Optional generic demo data: **`supabase/seeds/`** (not a production dump). Private org dumps belong under **`supabase/seeds/internal/`** (gitignored).

Org-wide agent defaults (organization name/about, timezone, currency, language, business definitions, PII refusal) live in **`app_settings`** and are edited at **`/admin/settings/workspace`**.

## Chat pipeline (happy path)

1. Client (`hooks/use-chat.ts`) sends **`ChatRequest`** (`session_id`, `message`) to **`POST /api/chat`**. The route builds the agent's **`ChatPayload`** server-side.
2. The route checks the session belongs to the signed-in user, builds the agent payload from the session, dashboard and profile rows, saves the **user** message via `saveChatMessageToSession`, may **auto-title** the session, builds history, and injects dashboard context, tables and workspace defaults.
3. **`resolveChatRuntime`** → **`streamAgentResponse`** streams the assistant. When the stream finishes, the orchestrator rebuilds the reply (content + **parts** / tool metadata) and the route's `saveReply` callback persists it, then a final `{ type: "saved", messageId }` chunk tells the client the stored id. The client never writes assistant messages; partial replies are saved on agent errors and client disconnects.

Related: **`POST /api/chat/reaction`**, **`POST /api/sessions`**, **`POST /api/sessions/share`**.

## Security notes (do not ignore)

- **Chat and session APIs** (`app/api/chat/*`, `app/api/sessions/*`) take identity from the cookie session only: `requireSignedIn()`, then `requireOwnedSession(client, sessionId, userId)` for anything session-scoped (404 for missing or foreign sessions). Never read `profileId`, `dashboardId` or `model` from the request body; derive them from the session and dashboard rows.
- **`lib/supabase/queries.ts`** functions take the caller's server client (`lib/supabase/server.ts`) so RLS sees the signed-in user. Do not pass the service-role client there.
- **Shared chats** are read only through the `get_shared_chat(token)` RPC (`007`), which returns the fields `/share/[token]` renders. Do not add table-level policies that expose other users' sessions or messages.
- **RLS** (`005`–`008`): no anon access to app tables; chat rows are owner-scoped via `current_profile_id()` (email lookup, because `profiles.id` can differ from `auth.uid()`); `profiles.user_role` and `chat_sessions.share_token` are not client-writable (column grants). New tables need explicit policies; never add `USING (true)` for writes.
- **Admin APIs** enforce roles server-side with `requireAdmin` / `requireEditorOrAdmin`; keep it that way.

## Commands

```bash
npm install
npm run dev          # turbopack
npm run build
npm run typecheck
npm run lint         # has pre-existing react-hooks errors; do not add new ones
npm run lint:tokens  # no color literals outside app/styles/palette.css
```

Do **not** run `npm run format` repo-wide: `.prettierrc` (`semi: false`) does not match the code style (semicolons everywhere except `components/ui/`), so it rewrites every file.

## Conventions

- Prefer **existing patterns** in `lib/application/` and `components/`; avoid unrelated refactors.
- **`@/`** path alias → repo root. Prefer it over `../` imports across folders.
- Keep **`ChatPayload`**, streaming behavior, and DB writes in sync when changing the agent or API contracts.
- Marketing copy and demo data: keep in **`components/marketing/config.ts`** and **`demo-data.ts`**; brand identity in **`lib/brand.ts`**.
- Landing color: never hardcode Powder hex in components. Primitives live in **`app/styles/palette.css`**, hero composition in **`app/styles/marketing-powder.css`**. Run **`npm run lint:tokens`**.
- Do not advertise roadmap items (for example Docker packaging, non-BigQuery connectors) as available on the landing page; label them "Coming soon".
