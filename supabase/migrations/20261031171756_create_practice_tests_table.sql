/*
# Create practice_tests table

1. New Tables
- `practice_tests`: AI-generated multiple-choice practice test for one document, stored as one row per document.
  - `id` (uuid, primary key)
  - `document_id` (uuid, the document the test belongs to, deleted with the document)
  - `user_id` (uuid, owner, defaults to the signed-in user)
  - `questions` (jsonb, list of questions with options, correct answer index and explanation)
  - `created_at` (timestamptz)

2. Security
- Row level security enabled.
- Only the owner can read, insert, update or delete their own rows.
- Grants limited to the `authenticated` role.

3. Notes
- Each document has at most one practice test (unique on document_id).
*/

CREATE TABLE IF NOT EXISTS practice_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT practice_tests_document_key UNIQUE (document_id)
);

ALTER TABLE practice_tests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON practice_tests TO authenticated;

DROP POLICY IF EXISTS "select_own_practice_tests" ON practice_tests;
CREATE POLICY "select_own_practice_tests" ON practice_tests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_practice_tests" ON practice_tests;
CREATE POLICY "insert_own_practice_tests" ON practice_tests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_practice_tests" ON practice_tests;
CREATE POLICY "update_own_practice_tests" ON practice_tests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_practice_tests" ON practice_tests;
CREATE POLICY "delete_own_practice_tests" ON practice_tests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
