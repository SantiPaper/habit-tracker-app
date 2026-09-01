ALTER TABLE event ADD COLUMN owner_user_id TEXT;
ALTER TABLE project ADD COLUMN owner_user_id TEXT;

CREATE INDEX idx_event_owner_user_id ON event(owner_user_id);
CREATE INDEX idx_project_owner_user_id ON project(owner_user_id);
