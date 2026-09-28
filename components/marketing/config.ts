export const MARKETING_NAV = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const TRUST_LABELS = [
  "Open source",
  "Self-hostable",
  "Bring your own model",
  "BigQuery supported",
] as const;

/**
 * Problem section copy + demo contrast. SEO leans on text-to-SQL / AI analytics /
 * BigQuery / published context without stuffing those phrases into every line.
 */
export const PROBLEM_SECTION = {
  eyebrow: "The problem",
  headlineLead: "Text-to-SQL reaches your warehouse.",
  headlineMute: "It still invents what revenue means.",
  body: "Generic AI analytics will write a query against BigQuery. It will not know which tables are approved, which revenue definition finance signed off on, or whether a dashboard is even published. You get a confident number and no way to defend it.",
  question: "What was net revenue last month?",
  ungoverned: {
    label: "Ungoverned text-to-SQL",
    tables: [
      "orders_raw",
      "orders_v2",
      "tmp_refunds",
      "finance_export",
      "stg_orders",
      "internal_test",
    ] as const,
    riskyTableIndexes: [1, 4] as const,
    metricLabel: "Revenue",
    metricTarget: 1.8,
    metricDecimals: 1,
    metricPrefix: "$",
    metricSuffix: "M",
    footnote: "Joined staging tables. Included refunds and internal transactions.",
  },
  governed: {
    label: "Evid · published context",
    contextLines: [
      "Dashboard · Revenue (published)",
      "Tables · orders_fact, campaigns, enrolments",
      "Rule · exclude refunds & internal",
      "Caveat · campaign ended mid-month",
    ] as const,
    metricLabel: "Net revenue",
    metricTarget: 1.42,
    metricDecimals: 2,
    metricPrefix: "$",
    metricSuffix: "M",
    footnote: "Scoped to approved tables and the published revenue definition.",
  },
} as const;

/**
 * Powder-style pricing tiers. No public dollar amounts — priceLabel is a path
 * (Self-host / Custom), not a sticker price. Available CTAs go to /book-demo;
 * roadmap stays mailto.
 */
export type PricingFeature =
  | { kind: "metric"; label: string; value: string }
  | { kind: "check"; label: string; included: boolean };

export const PRICING_PLANS: Array<{
  id: string;
  name: string;
  priceLabel: string;
  priceHint?: string;
  blurb: string;
  features: PricingFeature[];
  ctaLabel: string;
  /** Internal path or mailto subject key — see pricing section for wiring */
  cta: { type: "demo" } | { type: "mailto"; subject: string };
  highlighted?: boolean;
}> = [
  {
    id: "community",
    name: "Community",
    priceLabel: "Self-host",
    priceHint: "Roadmap",
    blurb: "Run Evid yourself. Bring your own Supabase, warehouse, and model keys.",
    features: [
      { kind: "metric", label: "Hosting", value: "Your infra" },
      { kind: "metric", label: "Dashboards", value: "Unlimited" },
      { kind: "metric", label: "Data sources", value: "BYO BigQuery" },
      { kind: "check", label: "Published context", included: true },
      { kind: "check", label: "Approved tables", included: true },
      { kind: "check", label: "Inspectable SQL", included: true },
      { kind: "check", label: "Managed hosting", included: false },
      { kind: "check", label: "Implementation help", included: false },
    ],
    ctaLabel: "Talk about Community",
    cta: { type: "mailto", subject: "Evid Community" },
  },
  {
    id: "cloud",
    name: "Cloud",
    priceLabel: "Custom",
    priceHint: "Available",
    blurb: "We host the app and help you connect dashboards, rules, and data sources.",
    features: [
      { kind: "metric", label: "Hosting", value: "Managed" },
      { kind: "metric", label: "Dashboards", value: "Unlimited" },
      { kind: "metric", label: "Data sources", value: "Per dashboard" },
      { kind: "check", label: "Published context", included: true },
      { kind: "check", label: "Approved tables", included: true },
      { kind: "check", label: "Inspectable SQL", included: true },
      { kind: "check", label: "Managed hosting", included: true },
      { kind: "check", label: "Implementation help", included: true },
    ],
    ctaLabel: "Book a demo",
    cta: { type: "demo" },
    highlighted: true,
  },
  {
    id: "setup",
    name: "Setup",
    priceLabel: "Custom",
    priceHint: "Available",
    blurb:
      "We wire your stack, publish your first dashboards, and hand over a working workspace.",
    features: [
      { kind: "metric", label: "Hosting", value: "Your choice" },
      { kind: "metric", label: "Dashboards", value: "First set shipped" },
      { kind: "metric", label: "Data sources", value: "Configured for you" },
      { kind: "check", label: "Published context", included: true },
      { kind: "check", label: "Approved tables", included: true },
      { kind: "check", label: "Inspectable SQL", included: true },
      { kind: "check", label: "Managed hosting", included: false },
      { kind: "check", label: "Full setup + handoff", included: true },
    ],
    ctaLabel: "Book a demo",
    cta: { type: "demo" },
  },
];

export const COMPARISON_ROWS: Array<{
  capability: string;
  generic: string;
  ours: string;
}> = [
  {
    capability: "Warehouse access",
    generic: "Broad or unrestricted",
    ours: "Dashboard-scoped",
  },
  {
    capability: "Business definitions",
    generic: "Prompt-dependent",
    ours: "Published context",
  },
  {
    capability: "Approved tables",
    generic: "Often absent",
    ours: "Explicitly allowlisted",
  },
  {
    capability: "Draft/publish workflow",
    generic: "No",
    ours: "Yes",
  },
  {
    capability: "Inspectable SQL",
    generic: "Sometimes",
    ours: "Yes",
  },
  {
    capability: "Per-dashboard data sources",
    generic: "Rare",
    ours: "Yes",
  },
  {
    capability: "Self-hosting",
    generic: "Depends",
    ours: "Designed for it (Docker path on roadmap)",
  },
];

export const FAQ_ITEMS: Array<{ id: string; question: string; answer: string }> = [
  {
    id: "warehouse-data",
    question: "Do you store warehouse data?",
    answer:
      "No. Queries run against your configured BigQuery project. Evid stores chat messages, dashboard context, and encrypted credentials in your Supabase project, never copies of warehouse tables.",
  },
  {
    id: "warehouses",
    question: "Which data warehouses are supported?",
    answer:
      "BigQuery is supported today, including per-dashboard data sources. Other connectors are on the roadmap.",
  },
  {
    id: "self-host",
    question: "Can Evid be self-hosted?",
    answer:
      "The app is designed to be self-hostable and avoids Vercel-only APIs. Docker packaging is on the roadmap; today the path is Supabase Cloud plus a containerized app.",
  },
  {
    id: "roles",
    question: "Who can edit and publish context?",
    answer:
      "Editors create and edit drafts. Admins publish and archive dashboards. Chat users only see and query published dashboards.",
  },
  {
    id: "bi-replace",
    question: "Does this replace our BI tool?",
    answer:
      "No. Evid works beside Metabase, Looker Studio, Looker, Power BI, or other BI tools, governing the AI layer around published context. It doesn't need to replace your charts.",
  },
  {
    id: "vs-generic",
    question: "How is this different from a generic AI SQL tool?",
    answer:
      "Questions are scoped to a published dashboard, grounded in business rules and caveats, limited to approved tables, and gated by role-based publishing. Every answer comes back with the SQL, the source tables, and the context that shaped it, so you can check the work.",
  },
  {
    id: "byo-model",
    question: "Can we bring our own model credentials?",
    answer:
      "Yes. Admins configure provider and API keys in settings (encrypted at rest). Environment-variable fallback remains supported for first-run and self-host setups.",
  },
  {
    id: "per-dashboard-bq",
    question: "Can each dashboard use a separate BigQuery project?",
    answer:
      "Yes. Assign an encrypted data source (project, location, credentials) independently per dashboard from the admin workspace.",
  },
];

/** Real, dated updates — sourced from actual shipped commits, not invented. */
export const CHANGELOG_ITEMS: Array<{ date: string; title: string; body: string }> = [
  {
    date: "2026-09-22",
    title: "New Evid brand identity",
    body: "Refreshed the logo, mark, and visual identity across the product and landing page.",
  },
  {
    date: "2026-09-22",
    title: "Clearer comparison table",
    body: "Redesigned the generic-vs-Evid comparison for easier scanning.",
  },
  {
    date: "2026-09-21",
    title: "Live hero demo",
    body: "The landing page now streams a real answer, chart, and SQL instead of a static screenshot.",
  },
];

export const CAPABILITIES = [
  {
    id: "registry",
    title: "Dashboard registry",
    body: "Create, draft, publish, and archive analytics dashboards. Chat users only see published dashboards.",
  },
  {
    id: "context",
    title: "Business context",
    body: "Define business rules, caveats, instructions, purpose, and example questions without changing application code.",
  },
  {
    id: "tables",
    title: "Approved tables",
    body: "Restrict each dashboard to specific warehouse tables so the agent stays within scope.",
  },
  {
    id: "sources",
    title: "Per-dashboard data sources",
    body: "Assign encrypted BigQuery credentials and data locations independently for each dashboard.",
  },
  {
    id: "inspect",
    title: "Inspectable answers",
    body: "Review the explanation, visualization, query, source tables, and applied context behind an answer.",
  },
  {
    id: "roles",
    title: "Roles and publishing",
    body: "Editors prepare context. Admins publish it. Users query only what has been approved.",
  },
] as const;
