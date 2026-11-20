CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL,
  location TEXT NOT NULL,
  brief TEXT NOT NULL,
  request_key TEXT UNIQUE NOT NULL,
  request_hash TEXT NOT NULL,
  receipt_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  privacy_version TEXT NOT NULL DEFAULT '2026-11-21'
);
CREATE INDEX IF NOT EXISTS enquiries_created ON enquiries(created_at);
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
