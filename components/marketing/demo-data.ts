/** Deterministic sample data for marketing demos (not a live API). */

export const HERO_DEMO_QUESTION = "Why did revenue fall last month?";

export const HERO_CONTEXT_STEPS = [
  "Checking the published Revenue dashboard",
  "Applying approved revenue definition",
  "Querying 3 approved tables",
  "Excluding refunded and internal orders",
] as const;

export const HERO_ANSWER = {
  headline: "Revenue decreased 12.4% compared with the previous month.",
  detail:
    "The largest decline came from the Enterprise plan after the campaign period ended.",
  metricLabel: "Net revenue",
  metricValue: 1.42,
  metricUnit: "M",
  changePct: -12.4,
  foundLabel: "Evid found something",
  sql: `SELECT
  DATE_TRUNC(order_date, MONTH) AS month,
  SUM(net_amount) AS net_revenue,
  COUNT(DISTINCT customer_id) AS customers
FROM analytics.orders_fact
WHERE dashboard_scope = 'revenue'
  AND is_refunded = FALSE
  AND is_internal = FALSE
GROUP BY 1
ORDER BY 1`,
  contextTags: [
    "Published · Revenue",
    "Rule · net revenue excludes refunds",
    "Tables · orders_fact, campaigns, customers",
  ],
};

export const HERO_CHART_DATA = [
  { week: "W1", revenue: 420, signups: 310, previous: 400 },
  { week: "W2", revenue: 455, signups: 340, previous: 415 },
  { week: "W3", revenue: 438, signups: 320, previous: 430 },
  { week: "W4", revenue: 390, signups: 270, previous: 445 },
  { week: "W5", revenue: 352, signups: 220, previous: 450 },
  { week: "W6", revenue: 335, signups: 205, previous: 440 },
];

/** Fixed reply when visitors type into the hero demo input. */
export const HERO_LIVE_REPLY = {
  prefix: "To explore this on your own data,",
  demoLabel: "book a demo",
};

export type ShowcaseChartType = "line" | "hbar" | "stacked" | "area";

export type ShowcaseQuestion = {
  id: string;
  question: string;
  summary: string;
  metricLabel: string;
  metricValue: string;
  observation: string;
  contextTags: string[];
  chartType: ShowcaseChartType;
  data: Array<Record<string, string | number>>;
  series: string[];
  textualSummary: string;
};

export const SHOWCASE_QUESTIONS: ShowcaseQuestion[] = [
  {
    id: "revenue-fall",
    question: "Why did revenue fall last month?",
    summary:
      "Net revenue fell 8.6% month over month. Refund volume tripled after the new pricing rolled out.",
    metricLabel: "MoM change",
    metricValue: "−8.6%",
    observation: "Refund spike begins the week pricing changed, not at month's start.",
    contextTags: ["Revenue dashboard", "Refund analysis", "Pricing change"],
    chartType: "line",
    series: ["revenue", "previous"],
    data: [
      { label: "W1", revenue: 430, previous: 420 },
      { label: "W2", revenue: 442, previous: 425 },
      { label: "W3", revenue: 418, previous: 428 },
      { label: "W4", revenue: 396, previous: 430 },
      { label: "W5", revenue: 380, previous: 432 },
      { label: "W6", revenue: 368, previous: 429 },
    ],
    textualSummary:
      "Line chart of weekly net revenue versus the previous period; revenue diverges from week 3 as refunds spike after a pricing change.",
  },
  {
    id: "products-growing",
    question: "Which products are growing fastest?",
    summary: "Pro leads growth at +28% signups. Team follows at +14%.",
    metricLabel: "Top growth",
    metricValue: "Pro +28%",
    observation: "Starter is flat; Enterprise contracted slightly after the campaign.",
    contextTags: ["Product mix", "Signups", "Published catalogue"],
    chartType: "hbar",
    series: ["growth"],
    data: [
      { label: "Pro", growth: 28 },
      { label: "Team", growth: 14 },
      { label: "Starter", growth: 2 },
      { label: "Enterprise", growth: -6 },
    ],
    textualSummary:
      "Horizontal bar chart of signup growth by product: Pro 28%, Team 14%, Starter 2%, Enterprise −6%.",
  },
  {
    id: "channel-signups",
    question: "Compare signups by acquisition channel.",
    summary:
      "Paid Social and Organic remain the largest channels. Affiliate share increased this quarter.",
    metricLabel: "Top channel",
    metricValue: "Paid Social",
    observation: "Affiliate grew from 12% to 18% of new signups.",
    contextTags: ["Acquisition", "Signups", "Channel mapping"],
    chartType: "stacked",
    series: ["organic", "paid", "affiliate", "direct"],
    data: [
      { label: "Q1", organic: 40, paid: 35, affiliate: 12, direct: 13 },
      { label: "Q2", organic: 38, paid: 36, affiliate: 14, direct: 12 },
      { label: "Q3", organic: 36, paid: 34, affiliate: 18, direct: 12 },
      { label: "Q4", organic: 35, paid: 33, affiliate: 20, direct: 12 },
    ],
    textualSummary:
      "Stacked bar chart of signup share by channel across quarters: Organic, Paid Social, Affiliate, Direct.",
  },
  {
    id: "unusual-activity",
    question: "Which dashboards have unusual activity?",
    summary:
      "Revenue and Marketing show elevated question volume this week versus their four-week baseline.",
    metricLabel: "Spike",
    metricValue: "Revenue +64%",
    observation: "Marketing questions cluster around weekend sessions.",
    contextTags: ["Usage", "Published only", "Session volume"],
    chartType: "area",
    series: ["questions"],
    data: [
      { label: "Mon", questions: 42 },
      { label: "Tue", questions: 48 },
      { label: "Wed", questions: 51 },
      { label: "Thu", questions: 90 },
      { label: "Fri", questions: 88 },
      { label: "Sat", questions: 70 },
      { label: "Sun", questions: 55 },
    ],
    textualSummary:
      "Area chart of daily questions on the Revenue dashboard; volume rises sharply Thursday and Friday.",
  },
];
