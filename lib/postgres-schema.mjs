// Shared by the setup/migration tools. Runtime queries never create tables.
export const POSTGRES_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS pulse_responses (
    id TEXT PRIMARY KEY, q1 TEXT NOT NULL, q2 TEXT NOT NULL,
    timestamp TEXT NOT NULL, user_agent TEXT NOT NULL, fingerprint TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS pulse_responses_timestamp ON pulse_responses(timestamp)`,
  `CREATE INDEX IF NOT EXISTS pulse_responses_fingerprint ON pulse_responses(fingerprint, timestamp)`,
  `CREATE TABLE IF NOT EXISTS survey_starts (session_id TEXT PRIMARY KEY, timestamp TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS waitlist (email TEXT PRIMARY KEY, timestamp TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY, interest TEXT NOT NULL, problems TEXT NOT NULL, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at BIGINT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS request_limits_expiry ON request_limits(expires_at)`,
];
