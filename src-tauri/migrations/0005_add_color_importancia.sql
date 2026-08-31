ALTER TABLE habit ADD COLUMN color TEXT;
ALTER TABLE habit ADD COLUMN importancia TEXT NOT NULL DEFAULT 'media' CHECK (importancia IN ('alta', 'media', 'baja'));
