import { DatabaseSync, backup } from 'node:sqlite';
import { existsSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import nextEnv from '@next/env';
import { neon } from '@neondatabase/serverless';
import { POSTGRES_SCHEMA } from '../lib/postgres-schema.mjs';

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');
const command = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const source = resolve(process.env.SLEEKVIBER_DB_PATH || 'data/survey.db');
const tables = ['pulse_responses', 'survey_starts', 'waitlist', 'responses'];

function openSource() {
  if (!existsSync(source)) throw new Error('SQLite source does not exist.');
  return new DatabaseSync(source, { readOnly: true });
}

function readSnapshot(db) {
  const integrity = db.prepare('PRAGMA quick_check').all();
  if (integrity.some(row => row.quick_check !== 'ok')) throw new Error('SQLite integrity check failed.');
  const snapshot = {};
  // One read transaction includes committed WAL data and a consistent snapshot.
  db.exec('BEGIN');
  try {
    for (const table of tables) {
      const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table);
      if (!exists && table !== 'responses') throw new Error('A required source table is missing.');
      snapshot[table] = exists ? db.prepare(`SELECT * FROM ${table}`).all() : [];
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  for (const row of snapshot.pulse_responses) {
    const answers = JSON.parse(row.q2);
    if (!Array.isArray(answers) || answers.some(value => typeof value !== 'string')) throw new Error('Invalid source answers.');
  }
  return snapshot;
}

function counts(snapshot) {
  return Object.fromEntries(tables.map(table => [table, snapshot[table].length]));
}

function hosted() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL for Neon first.');
  return neon(process.env.DATABASE_URL);
}

async function main() {
  if (command === 'setup') {
    const sql = hosted();
    await sql.transaction(POSTGRES_SCHEMA.map(statement => sql.query(statement)));
    console.log('Hosted database schema is ready. Existing records were preserved.');
  } else if (command === 'migrate') {
    const db = openSource();
    let snapshot;
    try { snapshot = readSnapshot(db); } finally { db.close(); }
    console.log(JSON.stringify({ source, dryRun, records: counts(snapshot) }, null, 2));
    if (dryRun) return;
    const sql = hosted();
    const inserts = [];
    for (const row of snapshot.pulse_responses) inserts.push(sql`INSERT INTO pulse_responses (id, q1, q2, timestamp, user_agent, fingerprint) VALUES (${row.id}, ${row.q1}, ${row.q2}, ${row.timestamp}, ${row.user_agent}, ${row.fingerprint}) ON CONFLICT DO NOTHING RETURNING id`);
    for (const row of snapshot.survey_starts) inserts.push(sql`INSERT INTO survey_starts (session_id, timestamp) VALUES (${row.session_id}, ${row.timestamp}) ON CONFLICT DO NOTHING RETURNING session_id`);
    for (const row of snapshot.waitlist) inserts.push(sql`INSERT INTO waitlist (email, timestamp) VALUES (${row.email}, ${row.timestamp}) ON CONFLICT DO NOTHING RETURNING email`);
    for (const row of snapshot.responses) inserts.push(sql`INSERT INTO responses (id, interest, problems, created_at) VALUES (${row.id}, ${row.interest}, ${row.problems}, ${row.created_at}) ON CONFLICT DO NOTHING RETURNING id`);
    if (inserts.length) {
      const results = await sql.transaction(inserts);
      console.log(`Migration committed: ${results.reduce((sum, rows) => sum + rows.length, 0)} new records. Existing IDs were preserved. SQLite was not modified.`);
    } else console.log('No records to migrate.');
  } else if (command === 'check') {
    if (process.env.DATABASE_URL) {
      const sql = hosted();
      const result = await sql.transaction(tables.map(table => sql.query(`SELECT COUNT(*) AS count FROM ${table}`)), { readOnly: true, isolationLevel: 'RepeatableRead' });
      console.log(JSON.stringify({ backend: 'Neon PostgreSQL', records: Object.fromEntries(tables.map((table, i) => [table, Number(result[i][0].count)])) }, null, 2));
    } else {
      const db = openSource();
      try { console.log(JSON.stringify({ backend: 'SQLite', source, integrity: 'ok', records: counts(readSnapshot(db)) }, null, 2)); }
      finally { db.close(); }
    }
  } else if (command === 'backup') {
    const db = openSource();
    const folder = join(dirname(source), 'backups');
    mkdirSync(folder, { recursive: true });
    const target = join(folder, `survey-${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}.db`);
    // Reserve a fresh filename. Never overwrite a previous backup.
    closeSync(openSync(target, 'wx', 0o600));
    try { await backup(db, target); } finally { db.close(); }
    const restored = new DatabaseSync(target);
    // The copied database may inherit WAL mode. Make the new snapshot a
    // self-contained file before handing it off or moving it elsewhere.
    restored.exec('PRAGMA journal_mode=DELETE');
    try { console.log(JSON.stringify({ backup: target, integrity: 'ok', records: counts(readSnapshot(restored)) }, null, 2)); }
    finally { restored.close(); }
  } else throw new Error('Use check, backup, setup, or migrate [--dry-run].');
}

main().catch(() => {
  console.error('Database operation failed. Check the command, source path, database configuration and schema. No connection credentials are printed.');
  process.exitCode = 1;
});
