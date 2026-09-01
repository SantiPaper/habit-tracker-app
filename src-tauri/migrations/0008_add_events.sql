CREATE TABLE IF NOT EXISTS event (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    fecha TEXT NOT NULL,
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_event_fecha ON event(fecha);
