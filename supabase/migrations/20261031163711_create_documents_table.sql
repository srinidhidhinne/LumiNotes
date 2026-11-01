/*
# Create documents table

1. New Tables
- `documents`: one row per uploaded study file.
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to the signed-in user)
  - `title` (text, required) display name for the material
  - `subject` (text, optional)
  - `chapter` (text, optional)
  - `learning_preferences` (text, optional)
  - `file_name` (text, required)
  - `file_type` (text, required)
  - `file_size` (integer, bytes)
  - `content` (text, extracted plain text)
  - `created_at` / `updated_at` (timestamptz)

2. Security
- Row level security enabled.
- Only the authenticated owner can read, insert, update or delete their own rows.
- Grants limited to the `authenticated` role.

3. Notes
- Owner column defaults to auth.uid() so inserts from the app do not need to send it.
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text,
  chapter text,
  learning_preferences text,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_user_id_created_at_idx ON documents (user_id, created_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
