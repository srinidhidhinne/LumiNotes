/*
# Create study_note_sections table

1. New Tables
- `study_note_sections`: AI-generated study notes, stored one row per section of a document.
  - `id` (uuid, primary key)
  - `document_id` (uuid, the document the notes belong to, deleted with the document)
  - `user_id` (uuid, owner, defaults to the signed-in user)
  - `chunk_index` (integer, position of the section within the document)
  - `label` (text, source reference such as "Pages 3-4")
  - `topics` (jsonb, structured topic explanations)
  - `created_at` (timestamptz)

2. Security
- Row level security enabled.
- Only the owner can read, insert, update or delete their own rows.
- Grants limited to the `authenticated` role.

3. Notes
- Each document has at most one row per section position (unique on document_id + chunk_index).
*/

CREATE TABLE IF NOT EXISTS study_note_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  label text NOT NULL,
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT study_note_sections_document_chunk_key UNIQUE (document_id, chunk_index)
);

ALTER TABLE study_note_sections ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON study_note_sections TO authenticated;

DROP POLICY IF EXISTS "select_own_study_note_sections" ON study_note_sections;
CREATE POLICY "select_own_study_note_sections" ON study_note_sections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_study_note_sections" ON study_note_sections;
CREATE POLICY "insert_own_study_note_sections" ON study_note_sections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_study_note_sections" ON study_note_sections;
CREATE POLICY "update_own_study_note_sections" ON study_note_sections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_study_note_sections" ON study_note_sections;
CREATE POLICY "delete_own_study_note_sections" ON study_note_sections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
