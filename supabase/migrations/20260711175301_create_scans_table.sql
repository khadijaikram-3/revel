/*
# Create scans table for Revel security assessments

## Purpose
Stores security scan results for the Revel web vulnerability scanner.
Each row represents one scan of a target URL, including the raw findings,
AI-generated executive and technical reports, and scan metadata.

## New Tables
- `scans`
  - `id` (uuid, primary key, auto-generated)
  - `target_url` (text, not null) — the URL that was scanned
  - `status` (text, not null, default 'pending') — pending | scanning | analyzing | complete | failed
  - `risk_score` (integer, nullable) — 0-100 risk score
  - `risk_level` (text, nullable) — High | Medium | Low
  - `vulnerabilities` (jsonb, nullable) — array of vulnerability objects
  - `executive_report` (jsonb, nullable) — AI-generated executive report
  - `technical_report` (jsonb, nullable) — AI-generated technical report
  - `duration` (text, nullable) — human-readable scan duration
  - `created_at` (timestamptz, default now())
  - `completed_at` (timestamptz, nullable)

## Security
- Enable RLS on `scans`.
- Single-tenant app (no sign-in) — allow anon + authenticated CRUD
  because scan data is intentionally public/shared within this app.
- Four separate policies for SELECT, INSERT, UPDATE, DELETE.
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  risk_score integer,
  risk_level text,
  vulnerabilities jsonb,
  executive_report jsonb,
  technical_report jsonb,
  duration text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scans" ON scans;
CREATE POLICY "anon_select_scans" ON scans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans" ON scans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scans" ON scans;
CREATE POLICY "anon_update_scans" ON scans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scans;
CREATE POLICY "anon_delete_scans" ON scans FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);