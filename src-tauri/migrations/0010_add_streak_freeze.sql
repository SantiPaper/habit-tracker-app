CREATE TABLE habit_streak_freeze (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habit(id) ON DELETE CASCADE,
    milestone_racha INTEGER NOT NULL,
    earned_at TEXT NOT NULL DEFAULT (datetime('now')),
    consumed_periodo TEXT,
    consumed_at TEXT,
    UNIQUE (habit_id, milestone_racha)
);

CREATE INDEX idx_streak_freeze_habit ON habit_streak_freeze(habit_id);
