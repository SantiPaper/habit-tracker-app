-- Marca de "esta fila de habit_log se borró" — un DELETE real no deja rastro para que la
-- sincronización entre dispositivos se entere de que algo desapareció. `deleteHabitLog` inserta
-- acá (mismo id que la fila borrada) en el mismo momento que borra la fila real.
CREATE TABLE IF NOT EXISTS habit_log_tombstone (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    periodo TEXT NOT NULL,
    deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
