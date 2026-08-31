CREATE TABLE habit_schedule_block (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habit(id) ON DELETE CASCADE,
    dias_semana TEXT NOT NULL,
    hora TEXT NOT NULL,
    duracion_minutos INTEGER
);

-- Backfill: todo hábito recurrente con hora ya cargada se vuelve su propio único bloque,
-- para que nada existente cambie de comportamiento tras la migración.
INSERT INTO habit_schedule_block (id, habit_id, dias_semana, hora, duracion_minutos)
SELECT lower(hex(randomblob(16))), id, dias_semana, hora, duracion_minutos
FROM habit
WHERE tipo = 'diario_recurrente' AND hora IS NOT NULL AND dias_semana IS NOT NULL;
