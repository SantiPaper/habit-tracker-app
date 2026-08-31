CREATE TABLE habit (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('diario_recurrente', 'diario_unico', 'semanal', 'mensual')),
    dias_semana TEXT,        -- JSON array of ints 0-6, only for diario_recurrente
    fecha TEXT,               -- YYYY-MM-DD, only for diario_unico
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE habit_log (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habit(id) ON DELETE CASCADE,
    periodo TEXT NOT NULL,   -- YYYY-MM-DD | YYYY-Www | YYYY-MM
    estado TEXT NOT NULL CHECK (estado IN ('cumplido', 'no_cumplido', 'pausado')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (habit_id, periodo)
);

CREATE INDEX idx_habit_log_habit_id ON habit_log(habit_id);
CREATE INDEX idx_habit_activo ON habit(activo);
