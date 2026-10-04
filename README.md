# Evid

**Ask your data. Get answers backed by evidence.**

Governed AI analytics. Ask questions in plain English and get charts, explanations, and inspectable SQL, grounded in approved dashboards, tables, and business rules.

[Website](https://evid.cc) · [Book a demo](https://evid.cc/book-demo) · [hello@evid.cc](mailto:hello@evid.cc)

![License: ELv2](https://img.shields.io/badge/license-Elastic%202.0-blue)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![Status: BigQuery](https://img.shields.io/badge/warehouse-BigQuery-4285F4)

## Why Evid

Text-to-SQL will query your warehouse, but it does not know which tables are approved or which revenue definition finance signed off on. Evid publishes that context first, then lets people ask.

- **Published context.** Editors draft business rules, caveats, and instructions. Admins publish. Chat only sees what is published.
- **Approved tables.** Each dashboard is limited to an explicit table allowlist.
- **Inspectable answers.** Every answer comes with its chart, SQL, source tables, and the context that shaped it.
- **Per-dashboard data sources.** Encrypted credentials, assigned independently per dashboard.
- **Bring your own model.** Anthropic, OpenAI, or OpenRouter, configured by env or in the admin UI.

## Status

| Area | State |
|------|-------|
| BigQuery | Supported |
| PostgreSQL, MySQL, Snowflake | Coming soon |
| Managed hosting (Evid Cloud) | Available, [contact us](mailto:hello@evid.cc) |
| Self-hosting | Allowed under ELv2; Docker packaging coming soon |

## How it works

```
User message
  → Next.js API route
    → LangGraph ReAct agent (Anthropic / OpenAI / OpenRouter)
      → BigQuery tools (list_tables, describe_table, execute_query)
    → Streamed response with inline tool-call blocks
  → Supabase (sessions, messages, encrypted settings)
```

## Quick start

**Requirements:** Node.js 20+, a Supabase project, an LLM API key, and a GCP service account with BigQuery Data Viewer and Job User roles.

```bash
npm install
cp .env.example .env.local   # then fill in the values
```

Apply the Supabase migrations in order (SQL editor or CLI):

```text
supabase/migrations/000_current_schema.sql
supabase/migrations/001_admin_workspace.sql
supabase/migrations/002_admin_top_dashboards_by_messages.sql
supabase/migrations/003_workspace_analytics_settings.sql
supabase/migrations/004_workspace_org_profile.sql
```

Optional generic demo data lives in `supabase/seeds/` (not a full production dump). Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and use `/app`. Set `ADMIN_EMAIL` to promote your first admin.

Configure org-wide agent defaults under **Admin → Settings → Workspace** (timezone, currency, language policy, business definitions, PII refusal). Per-dashboard context stays on each dashboard’s Context card.

### Key environment variables

Full list in [`.env.example`](.env.example).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only; admin APIs |
| `SETTINGS_ENCRYPTION_KEY` | Encrypts AI keys and BigQuery credentials stored from the admin UI |
| `SETTINGS_KDF_SALT` | Optional; set when migrating a DB that used a previous encryption salt |
| `MODEL_PROVIDER` | `anthropic`, `openai`, or `openrouter` |
| `BIGQUERY_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Fallback when a dashboard has no data source |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for sitemap and social tags |

Prefer configuring BigQuery under **Admin → Settings → Data sources** and assigning it per dashboard. Provider, model, and key can also be set under **Admin → Settings → Models**, which overrides env.

## Routes

| Path | Who | What |
|------|-----|------|
| `/` | Public | Marketing landing |
| `/app` | Signed in | Dashboard selector |
| `/chat/...` | Signed in | Analytics chat |
| `/admin/...` | Editor / admin | Context registry and settings |

## Project structure

```text
app/           Pages and API routes (chat, sessions, admin)
components/    marketing/, chat/, admin/, dashboard/
lib/           brand.ts, application/ (LangGraph agent), supabase/
supabase/      migrations/ and seeds/
```

Scripts: `npm run dev`, `build`, `typecheck`, `lint`, `lint:tokens`. Agent and contributor orientation is in [`AGENTS.md`](AGENTS.md); the roadmap is in [`PLAN.md`](PLAN.md).

## Contributing

Contributions are welcome. Open an [issue](https://github.com/niloy-biswas/evid/issues) to discuss larger changes first, then send a pull request. Run `npm run typecheck`, `npm run lint`, and `npm run lint:tokens` before you submit. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.

## License

Evid is **source-available** under the [Elastic License 2.0](LICENSE) (ELv2). You can use, copy, modify, and redistribute it, including inside your own business. You may not offer it to third parties as a hosted or managed service, and you may not remove license notices or circumvent license-key functionality.

Need Evid hosted, set up for you, or licensed for a hosted offering? Email **[hello@evid.cc](mailto:hello@evid.cc)**.
