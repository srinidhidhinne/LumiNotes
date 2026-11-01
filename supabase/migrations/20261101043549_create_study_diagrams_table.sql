/*
# Create study_diagrams table

1. New Tables
- `study_diagrams`: AI-generated concept diagram for one document, stored as one row per document.
  - `id` (uuid, primary key)
  - `document_id` (uuid, the document the diagram belongs to, deleted with the document)
  - `user_id` (uuid, owner, defaults to the signed-in user)
  - `diagram` (jsonb, the diagram title, nodes and connections)
  - `created_at` (timestamptz)

2. Security
- Row level security enabled.
- Only the owner can read, insert, update or delete their own rows.
- Grants limited to the `authenticated` role.

3. Notes
- Each document has at most one diagram (unique on document_id).
*/

CREATE TABLE IF NOT EXISTS study_diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  diagram jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT study_diagrams_document_key UNIQUE (document_id)
);

ALTER TABLE study_diagrams ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON study_diagrams TO authenticated;

DROP POLICY IF EXISTS "select_own_study_diagrams" ON study_diagrams;
CREATE POLICY "select_own_study_diagrams" ON study_diagrams FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_study_diagrams" ON study_diagrams;
CREATE POLICY "insert_own_study_diagrams" ON study_diagrams FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_study_diagrams" ON study_diagrams;
CREATE POLICY "update_own_study_diagrams" ON study_diagrams FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_study_diagrams" ON study_diagrams;
CREATE POLICY "delete_own_study_diagrams" ON study_diagrams FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
