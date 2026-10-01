-- Adds authentication to a database that was created before login existed.
-- Safe to run more than once.
--
-- Note on ordering: schema.sql runs first and creates the users table, then
-- adds the user_id column below to an existing tasks table. CREATE TABLE IF
-- NOT EXISTS does not add columns to a table that is already there, which is
-- why this file exists separately.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);

-- Tasks created before accounts existed have no owner. The first account to
-- register claims them (see userService.create).