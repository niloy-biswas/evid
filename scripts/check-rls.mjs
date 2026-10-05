#!/usr/bin/env node
/**
 * Fails if the database migrations (or the live database) would let the anon
 * role read or write app data, or let any role write every row.
 *
 * Static check (always runs): replays supabase/migrations/*.sql in filename
 * order, keeping CREATE/DROP POLICY, function REVOKEs and GRANTs, and fails on
 * the final state if it finds:
 *   - an INSERT/UPDATE/DELETE/ALL policy with USING (true) or WITH CHECK (true)
 *   - a policy with no TO clause (so it applies to anon) unless it is USING (false)
 *   - a GRANT ... TO anon
 *   - a callable public function never revoked from anon. Supabase grants
 *     EXECUTE to anon directly, so REVOKE ... FROM PUBLIC is not enough.
 *
 * Live check (when NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are set, e.g. from .env.local): one read-only GET per table with the anon
 * key. Returned rows fail; an empty 200 warns (RLS hides rows but the table
 * grant is still open).
 *
 * This exists because the repo has no CI; run it with `npm run lint:rls`
 * after adding a migration. It never writes anything.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

// Intentional exceptions: "table:policy name" for policies, "fn:name" for functions,
// "table:name" for live table access. Keep it empty unless you can say why next to the entry.
const ALLOWLIST = new Set([]);

const ANON_RE = /\banon\b/i;

const STATEMENT_RE = new RegExp(
  [
    String.raw`create\s+policy\s+(?<cpName>"[^"]+"|\w+)\s+on\s+(?:public\.)?(?<cpTable>\w+)(?<cpBody>[^;]*);`,
    String.raw`drop\s+policy\s+(?:if\s+exists\s+)?(?<dpName>"[^"]+"|\w+)\s+on\s+(?:public\.)?(?<dpTable>\w+)`,
    String.raw`alter\s+default\s+privileges[^;]*?\brevoke\b[^;]*?\bon\s+functions\s+from\s+(?<dfFrom>[^;]+);`,
    String.raw`create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?(?<fnName>\w+)\s*\((?<fnHead>[\s\S]*?)\bas\s+\$`,
    String.raw`revoke\s+[^;]*?\bon\s+function\s+(?:public\.)?(?<rvName>\w+)[^;]*?\bfrom\s+(?<rvFrom>[^;]+);`,
    String.raw`grant\s+[^;]*?\bto\s+(?<grTo>[^;]+);`,
    String.raw`create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(?<ctName>\w+)`,
    String.raw`drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?(?<dtName>\w+)`,
  ].join("|"),
  "gi"
);

const normalize = (sql) => sql.replace(/\s+/g, " ").trim().toLowerCase();
const unquote = (name) => name.replace(/"/g, "").toLowerCase();

// ── Replay migrations ──────────────────────────────────────

const policies = new Map(); // "table:name" -> { table, name, body, file }
const functions = new Map(); // name -> { file, isTrigger, anonRevoked }
const tables = new Set();
const anonGrants = [];
let newFunctionsClosedToAnon = false;

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8").replace(/--[^\n]*/g, "");

  for (const match of sql.matchAll(STATEMENT_RE)) {
    const g = match.groups;
    if (g.cpName) {
      const table = g.cpTable.toLowerCase();
      const name = unquote(g.cpName);
      policies.set(`${table}:${name}`, { table, name, body: normalize(g.cpBody), file });
    } else if (g.dpName) {
      policies.delete(`${g.dpTable.toLowerCase()}:${unquote(g.dpName)}`);
    } else if (g.dfFrom) {
      if (ANON_RE.test(g.dfFrom)) newFunctionsClosedToAnon = true;
    } else if (g.fnName) {
      const name = g.fnName.toLowerCase();
      const existing = functions.get(name); // CREATE OR REPLACE keeps earlier grants
      functions.set(name, {
        file,
        isTrigger: /\breturns\s+trigger\b/i.test(g.fnHead),
        anonRevoked: existing?.anonRevoked || newFunctionsClosedToAnon,
      });
    } else if (g.rvName) {
      const fn = functions.get(g.rvName.toLowerCase());
      if (fn && ANON_RE.test(g.rvFrom)) fn.anonRevoked = true;
    } else if (g.grTo) {
      if (ANON_RE.test(g.grTo)) anonGrants.push({ file, text: normalize(match[0]) });
    } else if (g.ctName) {
      tables.add(g.ctName.toLowerCase());
    } else if (g.dtName) {
      tables.delete(g.dtName.toLowerCase());
    }
  }
}

// ── Static rules ───────────────────────────────────────────

const failures = [];
const warnings = [];

for (const { table, name, body, file } of policies.values()) {
  if (ALLOWLIST.has(`${table}:${name}`)) continue;

  const cmd = body.match(/\bfor (all|select|insert|update|delete)\b/)?.[1] ?? "all";
  const roles = body.match(/\bto ([\w, ]+?)(?= using\b| with\b|$)/)?.[1].split(",").map((r) => r.trim()) ?? [
    "public",
  ];
  const allowsEveryRow = /\busing \( ?true ?\)/.test(body) || /\bwith check \( ?true ?\)/.test(body);
  const deniesEverything = /\busing \( ?false ?\)/.test(body);

  if (cmd !== "select" && allowsEveryRow) {
    failures.push(`${file}: policy "${name}" on ${table} lets ${roles.join(", ")} ${cmd} every row (true).`);
  }
  if (!deniesEverything && roles.some((r) => r === "public" || r === "anon")) {
    failures.push(`${file}: policy "${name}" on ${table} applies to anon (no TO clause or TO anon/public).`);
  }
}

for (const grant of anonGrants) {
  failures.push(`${grant.file}: grants to anon: ${grant.text}`);
}

for (const [name, fn] of functions) {
  if (fn.isTrigger || fn.anonRevoked || ALLOWLIST.has(`fn:${name}`)) continue;
  failures.push(`${fn.file}: function ${name}() is callable by anon; add "revoke all on function public.${name}(...) from anon".`);
}

// ── Live probe (read-only) ─────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let liveSummary = "skipped (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set)";

if (url && anonKey) {
  let probed = 0;
  try {
    for (const table of [...tables].sort()) {
      if (ALLOWLIST.has(`table:${table}`)) continue;
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      });
      probed++;
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          failures.push(`live: anon key can read rows from ${table}.`);
        } else {
          warnings.push(`live: anon key can query ${table} (no rows visible); revoke the table grant from anon.`);
        }
      } else if (res.status !== 401 && res.status !== 403) {
        warnings.push(`live: ${table} returned HTTP ${res.status} for anon (expected 401).`);
      }
    }
    liveSummary = `${probed} table(s) probed with the anon key`;
  } catch (e) {
    liveSummary = `skipped (network error: ${e instanceof Error ? e.message : String(e)})`;
  }
}

// ── Report ─────────────────────────────────────────────────

for (const w of warnings) console.warn(`  ! ${w}`);

if (failures.length > 0) {
  console.error(`\n✗ lint:rls found ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\nScope policies with TO authenticated and an owner check, revoke new functions from anon,` +
      `\nand never grant to anon. Live check: ${liveSummary}.` +
      `\nIf this is a deliberate exception, add it to ALLOWLIST in scripts/check-rls.mjs with a reason.\n`
  );
  process.exit(1);
} else {
  console.log(
    `✓ lint:rls — ${policies.size} policies, ${functions.size} functions checked across ${files.length} migrations; live: ${liveSummary}`
  );
}
