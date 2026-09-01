CREATE TABLE project (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    deadline TEXT NOT NULL,
    notas TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'hecho')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_project_deadline ON project(deadline);
