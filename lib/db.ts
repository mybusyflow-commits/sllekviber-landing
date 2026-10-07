import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { Q1_OPTIONS, Q2_OPTIONS, type Q1Answer, type Q2Answer } from "@/lib/options";

let database: DatabaseSync | undefined;

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
  `);
  return database;
}

export function recordStart(sessionId: string) {
  getDb().prepare("INSERT OR IGNORE INTO survey_starts (session_id, timestamp) VALUES (?, ?)").run(sessionId, new Date().toISOString());
}

export function recentDuplicate(fingerprint: string) {
  const since = new Date(Date.now() - 60_000).toISOString();
  return Boolean(getDb().prepare("SELECT 1 FROM pulse_responses WHERE fingerprint = ? AND timestamp >= ? LIMIT 1").get(fingerprint, since));
}

export function insertSubmission(row: Submission, fingerprint: string) {
  getDb().prepare("INSERT INTO pulse_responses (id, q1, q2, timestamp, user_agent, fingerprint) VALUES (?, ?, ?, ?, ?, ?)")
    .run(row.id, row.q1, JSON.stringify(row.q2), row.timestamp, row.userAgent, fingerprint);
}

export function insertEmail(email: string) {
  const result = getDb().prepare("INSERT OR IGNORE INTO waitlist (email, timestamp) VALUES (?, ?)").run(email, new Date().toISOString());
  return result.changes > 0;
}

export function getStats() {
  const db = getDb();
  const rows = db.prepare("SELECT id, q1, q2, timestamp, user_agent FROM pulse_responses ORDER BY timestamp DESC").all() as unknown as {
    id: string; q1: Q1Answer; q2: string; timestamp: string; user_agent: string;
  }[];
  const today = new Date().toISOString().slice(0, 10);
  const starts = Number((db.prepare("SELECT COUNT(*) AS count FROM survey_starts").get() as { count: number }).count);
  const legacyCount = Number((db.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name='responses'").get() as { count: number }).count)
    ? Number((db.prepare("SELECT COUNT(*) AS count FROM responses").get() as { count: number }).count) : 0;
  const q1 = Q1_OPTIONS.map((option) => ({ option, count: rows.filter((r) => r.q1 === option).length }));
  const q2 = Q2_OPTIONS.map((option) => ({ option, count: rows.filter((r) => (JSON.parse(r.q2) as string[]).includes(option)).length }));
  return {
    total: rows.length,
    today: rows.filter((r) => r.timestamp.startsWith(today)).length,
    starts,
    completionRate: starts ? Math.min(100, Math.round(rows.length / starts * 100)) : 0,
    legacyCount,
    waitlist: Number((db.prepare("SELECT COUNT(*) AS count FROM waitlist").get() as { count: number }).count),
    q1,
    q2,
    recent: rows.slice(0, 25).map((r) => ({ id: r.id, q1: r.q1, q2: JSON.parse(r.q2) as Q2Answer[], timestamp: r.timestamp })),
  };
}
