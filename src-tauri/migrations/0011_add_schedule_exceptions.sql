CREATE TABLE IF NOT EXISTS habit_schedule_exception (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habit(id) ON DELETE CASCADE,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    duracion_minutos INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (habit_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_schedule_exception_habit_fecha ON habit_schedule_exception(habit_id, fecha);
