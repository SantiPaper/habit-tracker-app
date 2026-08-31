CREATE TABLE habit_period_claim (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habit(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('semanal', 'mensual')),
    periodo TEXT NOT NULL,
    xp_otorgado INTEGER NOT NULL,
    reclamado_en TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (habit_id, tipo, periodo)
);
