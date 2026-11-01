/*
# Create user_preferences table

1. New Tables
- `user_preferences`
  - `user_id` (uuid, primary key, defaults to the signed-in user, references auth.users)
  - `theme` (text, either 'light' or 'dark', defaults to 'light')
  - `updated_at` (timestamptz, set when the preference is saved)

2. Security
- Enable RLS on `user_preferences`.
- Grant SELECT, INSERT and UPDATE to `authenticated` only (no delete is needed).
- Owner-scoped policies: each signed-in user can only read and write their own row.

3. Notes
- Each user has at most one row, so saving the theme is an upsert keyed on user_id.
- Rows are removed automatically if the account is deleted.
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;

DROP POLICY IF EXISTS "select_own_preferences" ON user_preferences;
CREATE POLICY "select_own_preferences" ON user_preferences FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_preferences" ON user_preferences;
CREATE POLICY "insert_own_preferences" ON user_preferences FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_preferences" ON user_preferences;
CREATE POLICY "update_own_preferences" ON user_preferences FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
