/*
# Create app_secrets table for server-side API key storage

1. New Tables
- `app_secrets` — stores sensitive API keys for edge functions
- `key_name` (text, unique) — the name of the secret (e.g. "GEMINI_API_KEY")
- `key_value` (text) — the actual secret value
- `created_at` (timestamptz)

2. Security
- RLS enabled with no policies — the table is locked down completely.
- Only the service role (used by edge functions) can read/write.
- The anon/authenticated roles cannot access any data.
- The frontend never touches this table.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
