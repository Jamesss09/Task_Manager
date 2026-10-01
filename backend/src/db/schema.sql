-- Schema for the Task Manager app.
-- Run it with: npm run db:migrate

-- Accounts. Passwords are stored only as bcrypt hashes, never in plain text.
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INTEGER REFERENCES users (id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The tasks_user_id_idx index is created by the migration instead, because
-- on an existing database the column is added there.
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks (created_at DESC);