import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { Q1_OPTIONS, Q2_OPTIONS, type Q1Answer, type Q2Answer } from "@/lib/options";

let database: DatabaseSync | undefined;
let postgres: NeonQueryFunction<false, false> | undefined;

function getPostgres() {
  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL) throw new Error("Set DATABASE_URL before enabling poll storage on Vercel.");
    return null;
  }
  return postgres ??= neon(process.env.DATABASE_URL);
}

export type Submission = {
  id: string;
  q1: Q1Answer;
  q2: Q2Answer[];
  timestamp: string;
  userAgent: string;
};

export function getDb() {
  if (database) return database;
  const file = process.env.SLEEKVIBER_DB_PATH || join(process.cwd(), "data", "survey.db");
  mkdirSync(dirname(file), { recursive: true });
  database = new DatabaseSync(file);
  database.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS pulse_responses (
      id TEXT PRIMARY KEY,
      q1 TEXT NOT NULL,
      q2 TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      fingerprint TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS pulse_responses_timestamp ON pulse_responses(timestamp);
    CREATE INDEX IF NOT EXISTS pulse_responses_fingerprint ON pulse_responses(fingerprint, timestamp);
    CREATE TABLE IF NOT EXISTS survey_starts (
      session_id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS waitlist (
      email TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS request_limits (
      key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS request_limits_expiry ON request_limits(expires_at);
  `);
  return database;
}

export async function recordStart(sessionId: string) {
  const sql = getPostgres();
  if (sql) {
    await sql`INSERT INTO survey_starts (session_id, timestamp) VALUES (${sessionId}, ${new Date().toISOString()}) ON CONFLICT DO NOTHING`;
    return;
  }
  getDb().prepare("INSERT OR IGNORE INTO survey_starts (session_id, timestamp) VALUES (?, ?)").run(sessionId, new Date().toISOString());
}

function recentDuplicate(fingerprint: string) {
  const since = new Date(Date.now() - 60_000).toISOString();
  return Boolean(getDb().prepare("SELECT 1 FROM pulse_responses WHERE fingerprint = ? AND timestamp >= ? LIMIT 1").get(fingerprint, since));
}

export async function insertSubmission(row: Submission, fingerprint: string) {
  const sql = getPostgres();
  if (sql) {
    // Serialize identical answers across function instances, then check again
    // inside the transaction. Each statement uses a fresh READ COMMITTED snapshot.
    const results = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${fingerprint}, 0))`,
      sql`INSERT INTO pulse_responses (id, q1, q2, timestamp, user_agent, fingerprint)
        SELECT ${row.id}, ${row.q1}, ${JSON.stringify(row.q2)}, ${row.timestamp}, ${row.userAgent}, ${fingerprint}
        WHERE NOT EXISTS (SELECT 1 FROM pulse_responses WHERE fingerprint = ${fingerprint}
          AND timestamp >= ${new Date(Date.now() - 60_000).toISOString()}) RETURNING id`,
    ], { isolationLevel: "ReadCommitted" });
    return results[1].length > 0;
  }
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const duplicate = recentDuplicate(fingerprint);
    if (!duplicate) db.prepare("INSERT INTO pulse_responses (id, q1, q2, timestamp, user_agent, fingerprint) VALUES (?, ?, ?, ?, ?, ?)")
      .run(row.id, row.q1, JSON.stringify(row.q2), row.timestamp, row.userAgent, fingerprint);
    db.exec("COMMIT");
    return !duplicate;
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const sql = getPostgres();
  let row: { count: number; expires_at: number | string };
  if (sql) {
    const result = await sql.transaction([
      sql`DELETE FROM request_limits WHERE expires_at <= ${now}`,
      sql`INSERT INTO request_limits (key, count, expires_at) VALUES (${key}, 1, ${now + windowMs})
        ON CONFLICT (key) DO UPDATE SET
          count = CASE WHEN request_limits.expires_at <= ${now} THEN 1 ELSE request_limits.count + 1 END,
          expires_at = CASE WHEN request_limits.expires_at <= ${now} THEN ${now + windowMs} ELSE request_limits.expires_at END
        RETURNING count, expires_at`,
    ]);
    row = result[1][0] as typeof row;
  } else {
    const db = getDb();
    db.prepare("DELETE FROM request_limits WHERE expires_at <= ?").run(now);
    row = db.prepare(`INSERT INTO request_limits (key, count, expires_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = CASE WHEN request_limits.expires_at <= ? THEN 1 ELSE request_limits.count + 1 END,
      expires_at = CASE WHEN request_limits.expires_at <= ? THEN excluded.expires_at ELSE request_limits.expires_at END
      RETURNING count, expires_at`).get(key, now + windowMs, now, now) as typeof row;
  }
  return { allowed: row.count <= limit, retryAfter: Math.max(1, Math.ceil((Number(row.expires_at) - now) / 1000)) };
}

export async function checkStorage() {
  const sql = getPostgres();
  if (sql) await sql.transaction([
    sql`SELECT id FROM pulse_responses LIMIT 0`,
    sql`SELECT session_id FROM survey_starts LIMIT 0`,
    sql`SELECT email FROM waitlist LIMIT 0`,
    sql`SELECT id FROM responses LIMIT 0`,
    sql`SELECT key FROM request_limits LIMIT 0`,
  ], { readOnly: true });
  else getDb().prepare("SELECT id FROM pulse_responses LIMIT 0").all();
}

export async function insertEmail(email: string) {
  const sql = getPostgres();
  if (sql) {
    const rows = await sql`INSERT INTO waitlist (email, timestamp) VALUES (${email}, ${new Date().toISOString()}) ON CONFLICT DO NOTHING RETURNING email`;
    return rows.length > 0;
  }
  const result = getDb().prepare("INSERT OR IGNORE INTO waitlist (email, timestamp) VALUES (?, ?)").run(email, new Date().toISOString());
  return result.changes > 0;
}

export async function getStats() {
  type ResponseRow = {
    id: string; q1: Q1Answer; q2: string; timestamp: string; user_agent: string;
  };
  const sql = getPostgres();
  let rows: ResponseRow[], starts: number, legacyCount: number, waitlist: number;
  if (sql) {
    const result = await sql.transaction([
      sql`SELECT id, q1, q2, timestamp, user_agent FROM pulse_responses ORDER BY timestamp DESC`,
      sql`SELECT COUNT(*) AS count FROM survey_starts`,
      sql`SELECT COUNT(*) AS count FROM responses`,
      sql`SELECT COUNT(*) AS count FROM waitlist`,
    ], { isolationLevel: "RepeatableRead", readOnly: true });
    rows = result[0] as ResponseRow[];
    starts = Number(result[1][0].count);
    legacyCount = Number(result[2][0].count);
    waitlist = Number(result[3][0].count);
  } else {
    const db = getDb();
    rows = db.prepare("SELECT id, q1, q2, timestamp, user_agent FROM pulse_responses ORDER BY timestamp DESC").all() as unknown as ResponseRow[];
    starts = Number((db.prepare("SELECT COUNT(*) AS count FROM survey_starts").get() as { count: number }).count);
    legacyCount = Number((db.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name='responses'").get() as { count: number }).count)
      ? Number((db.prepare("SELECT COUNT(*) AS count FROM responses").get() as { count: number }).count) : 0;
    waitlist = Number((db.prepare("SELECT COUNT(*) AS count FROM waitlist").get() as { count: number }).count);
  }
  const today = new Date().toISOString().slice(0, 10);
  const q1 = Q1_OPTIONS.map((option) => ({ option, count: rows.filter((r) => r.q1 === option).length }));
  const q2 = Q2_OPTIONS.map((option) => ({ option, count: rows.filter((r) => (JSON.parse(r.q2) as string[]).includes(option)).length }));
  return {
    total: rows.length,
    today: rows.filter((r) => r.timestamp.startsWith(today)).length,
    starts,
    completionRate: starts ? Math.min(100, Math.round(rows.length / starts * 100)) : 0,
    legacyCount,
    waitlist,
    q1,
    q2,
    recent: rows.slice(0, 25).map((r) => ({ id: r.id, q1: r.q1, q2: JSON.parse(r.q2) as Q2Answer[], timestamp: r.timestamp })),
  };
}

// Public research results query aggregates only. Individual responses and
// operational/admin fields never enter this response path.
export async function getPublicResults() {
  const sql = getPostgres();
  const today = new Date().toISOString().slice(0, 10);
  let totals: { total: number | string; today: number | string };
  let sentiments: { option: string; count: number | string }[];
  let pains: { option: string; count: number | string }[];
  if (sql) {
    const results = await sql.transaction([
      sql`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE substring(timestamp, 1, 10) = ${today}) AS today FROM pulse_responses`,
      sql`SELECT q1 AS option, COUNT(*) AS count FROM pulse_responses GROUP BY q1`,
      sql`SELECT answer.value AS option, COUNT(*) AS count FROM pulse_responses, LATERAL jsonb_array_elements_text(q2::jsonb) AS answer(value) GROUP BY answer.value`,
    ], { isolationLevel: "RepeatableRead", readOnly: true });
    totals = results[0][0] as typeof totals;
    sentiments = results[1] as typeof sentiments;
    pains = results[2] as typeof pains;
  } else {
    const db = getDb();
    db.exec("BEGIN");
    try {
      totals = db.prepare("SELECT COUNT(*) AS total, COUNT(CASE WHEN substr(timestamp, 1, 10) = ? THEN 1 END) AS today FROM pulse_responses").get(today) as typeof totals;
      sentiments = db.prepare("SELECT q1 AS option, COUNT(*) AS count FROM pulse_responses GROUP BY q1").all() as typeof sentiments;
      pains = db.prepare("SELECT answer.value AS option, COUNT(*) AS count FROM pulse_responses, json_each(pulse_responses.q2) AS answer GROUP BY answer.value").all() as typeof pains;
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
  }
  const countFor = (rows: typeof sentiments, option: string) => Number(rows.find(row => row.option === option)?.count || 0);
  return {
    total: Number(totals.total), today: Number(totals.today),
    q1: Q1_OPTIONS.map(option => ({ option, count: countFor(sentiments, option) })),
    q2: Q2_OPTIONS.map(option => ({ option, count: countFor(pains, option) })),
  };
}
