/*
# Create bookmarks table

1. New Tables
- `bookmarks`: terms the signed-in user saved from a document's flashcards.
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to the signed-in user)
  - `document_id` (uuid, the document the term came from, deleted with the document)
  - `term` (text, the term being saved)
  - `meaning` (text, its meaning at the time it was saved)
  - `topic` (text, the topic heading it came from)
  - `created_at` (timestamptz)

2. Security
- Row level security enabled.
- Only the owner can read, insert, update or delete their own rows.
- Grants limited to the `authenticated` role.

3. Notes
- A term can be saved once per document per user (unique on user_id, document_id, term).
*/

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  term text NOT NULL,
  meaning text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_user_document_term_key UNIQUE (user_id, document_id, term)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON bookmarks TO authenticated;

DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_bookmarks" ON bookmarks;
CREATE POLICY "update_own_bookmarks" ON bookmarks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
