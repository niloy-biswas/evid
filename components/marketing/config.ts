export const MARKETING_NAV = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "#deployment", label: "Deployment" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Problem section copy + demo contrast. SEO leans on text-to-SQL / AI analytics /
 * BigQuery / published context without stuffing those phrases into every line.
 */
export const PROBLEM_SECTION = {
  eyebrow: "The problem",
  headlineLead: "Text-to-SQL reaches your warehouse.",
  headlineMute: "It still guesses what revenue means.",
  body: "Text-to-SQL will query your warehouse. It will not know which tables are approved or which revenue definition finance signed off on.",
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
    riskyTableIndexes: [1, 2, 4, 5] as const,
    metricLabel: "Revenue",
    metricTarget: 1.8,
    metricDecimals: 1,
    metricPrefix: "$",
    metricSuffix: "M",
    footnote:
      "Joined a duplicate table and staging data. Included refunds and internal transactions.",
  },
  governed: {
    label: "Evid · published context",
    contextLines: [
      "Dashboard · Revenue (published)",
      "Tables · orders_fact, campaigns, customers",
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

/** Warehouses Evid connects to. Only BigQuery is live today. */
export const DATA_SOURCES: Array<{ name: string; live: boolean }> = [
  { name: "BigQuery", live: true },
  { name: "PostgreSQL", live: false },
  { name: "MySQL", live: false },
  { name: "Snowflake", live: false },
];

export const SECURITY_POINTS = [
  { id: "stays", title: "Data stays in your warehouse", icon: "database", spec: "ZERO COPY" },
  { id: "scope", title: "Only approved tables are queried", icon: "table", spec: "ALLOWLIST" },
  { id: "keys", title: "Credentials encrypted at rest", icon: "lock", spec: "AES-256" },
  { id: "sql", title: "Every query is inspectable", icon: "code", spec: "FULL AUDIT" },
] as const;

export const SECURITY_FLOW = [
  { id: "ask", title: "Your question", hint: "Plain English", icon: "message" },
  { id: "evid", title: "Evid", hint: "Agent, no data stored", icon: "spark" },
  { id: "context", title: "Published context", hint: "Rules · approved tables", icon: "shield" },
  { id: "warehouse", title: "Your warehouse", hint: "BigQuery today", icon: "database" },
] as const;

/** Deployment paths. No public prices; every path starts with a demo or an email. */
export const DEPLOY_OPTIONS: Array<{
  id: string;
  name: string;
  status: string;
  blurb: string;
  points: string[];
  ctaLabel: string;
  cta: { type: "demo" } | { type: "mailto"; subject: string };
  highlighted?: boolean;
  available: boolean;
}> = [
  {
    id: "cloud",
    name: "Evid Cloud",
    status: "Available",
    blurb: "We host and run Evid for you.",
    points: ["Managed hosting", "Separate data source per dashboard", "Onboarding with our team"],
    ctaLabel: "Book a demo",
    cta: { type: "demo" },
    highlighted: true,
    available: true,
  },
  {
    id: "assisted",
    name: "Your infrastructure",
    status: "Assisted",
    blurb: "We set Evid up in your environment and hand it over.",
    points: ["Runs in your cloud", "First dashboards published", "Handover included"],
    ctaLabel: "Book a demo",
    cta: { type: "demo" },
    available: true,
  },
  {
    id: "community",
    name: "Self-host",
    status: "Docker soon",
    blurb: "Run Evid yourself under the Elastic License 2.0.",
    points: ["Your Supabase, warehouse, and model keys", "Unlimited dashboards"],
    ctaLabel: "Get notified",
    cta: { type: "mailto", subject: "Evid self-hosting" },
    available: false,
  },
];

export const COMPARISON_ROWS: Array<{
  capability: string;
  generic: string;
  ours: string;
}> = [
  { capability: "Query scope", generic: "Whole schema", ours: "One published dashboard" },
  {
    capability: "Business definitions",
    generic: "Left to the prompt",
    ours: "Published before query time",
  },
  { capability: "Table access", generic: "Whatever the schema exposes", ours: "Approved list only" },
  { capability: "Publishing", generic: "None", ours: "Draft, then publish" },
  {
    capability: "Evidence",
    generic: "Query and result",
    ours: "Answer, chart, SQL, context",
  },
];

export const FAQ_ITEMS: Array<{ id: string; question: string; answer: string }> = [
  {
    id: "warehouse-data",
    question: "Do you store warehouse data?",
    answer:
      "No. Queries run in your own BigQuery project. Evid stores chats, dashboard context, and encrypted credentials, never copies of your tables.",
  },
  {
    id: "warehouses",
    question: "Which data warehouses are supported?",
    answer:
      "BigQuery today, with a separate project per dashboard if you need it. PostgreSQL, MySQL, and Snowflake are coming soon.",
  },
  {
    id: "self-host",
    question: "Can we self-host Evid?",
    answer:
      "Yes. Evid is licensed under the Elastic License 2.0, so you can run it in your own environment, just not resell it as a hosted service. Docker packaging is coming soon, and we can set it up for you today.",
  },
  {
    id: "roles",
    question: "Who can edit and publish context?",
    answer:
      "Editors write drafts. Admins publish and archive. Chat users only see published dashboards.",
  },
  {
    id: "bi-replace",
    question: "Does this replace our BI tool?",
    answer:
      "No. Evid sits beside Metabase, Looker, Power BI, or whatever you use, and governs the AI layer.",
  },
  {
    id: "vs-generic",
    question: "How is this different from a generic AI SQL tool?",
    answer:
      "Questions stay inside a published dashboard, its business rules, and its approved tables. Every answer shows the SQL and context behind it.",
  },
  {
    id: "byo-model",
    question: "Can we bring our own model credentials?",
    answer: "Yes. Admins add a provider and API key in settings. Keys are encrypted at rest.",
  },
];
