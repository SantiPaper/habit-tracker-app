ALTER TABLE habit ADD COLUMN owner_user_id TEXT;

CREATE INDEX idx_habit_owner_user_id ON habit(owner_user_id);
