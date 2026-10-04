-- ============================================================
-- Optional demo seed (generic — not org-specific).
-- Assumes migrations 000–003 have already been applied.
-- Do NOT run against a production database that already has data.
-- ============================================================

-- Demo dashboards (skip if short IDs already exist)
INSERT INTO public.dashboards
  (dashboard_id, dashboard_name, vertical, purpose, link, refresh_window, description, available_metrics, available_filters, status)
SELECT v.*
FROM (
  VALUES
    (
      'DEMO1',
      'Sales Overview',
      'Revenue',
      'Sample revenue and orders dashboard for self-host demos',
      NULL::text,
      'Daily',
      'Demo dashboard for exploring Evid with your own BigQuery tables. Replace table mappings in Admin.',
      ARRAY['revenue', 'orders']::text[],
      ARRAY['date', 'channel']::text[],
      'published'
    ),
    (
      'DEMO2',
      'Product Engagement',
      'Product',
      'Sample engagement metrics dashboard',
      NULL::text,
      'Daily',
      'Second demo dashboard. Point approved tables at your warehouse via Admin → Dashboard registry.',
      ARRAY['active_users', 'sessions']::text[],
      ARRAY['date', 'product']::text[],
      'draft'
    )
) AS v(
  dashboard_id, dashboard_name, vertical, purpose, link, refresh_window, description,
  available_metrics, available_filters, status
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.dashboards d WHERE d.dashboard_id = v.dashboard_id
);

-- Demo table mappings (only when dashboard exists and has no mappings yet)
INSERT INTO public.dashboard_tables (dashboard_id, table_name, row_count, description, notes)
SELECT v.dashboard_id, v.table_name, v.row_count, v.description, v.notes
FROM (
  VALUES
    (
      'DEMO1',
      'analytics.orders_daily',
      '1.2M',
      'Daily order aggregates by channel (replace with your table).',
      'Example only — update in Admin'
    ),
    (
      'DEMO1',
      'analytics.revenue_by_product',
      '45K',
      'Product-level revenue rollup (replace with your table).',
      NULL
    ),
    (
      'DEMO2',
      'analytics.user_sessions',
      '8.5M',
      'Session-level engagement events (replace with your table).',
      NULL
    )
) AS v(dashboard_id, table_name, row_count, description, notes)
WHERE EXISTS (
  SELECT 1 FROM public.dashboards d WHERE d.dashboard_id = v.dashboard_id
)
AND NOT EXISTS (
  SELECT 1 FROM public.dashboard_tables t WHERE t.dashboard_id = v.dashboard_id
);
