import type { ColumnType } from 'kysely'

export interface Database {
    habit: HabitTable
    habit_log: HabitLogTable
    setting: SettingTable
    habit_period_claim: HabitPeriodClaimTable
    habit_schedule_block: HabitScheduleBlockTable
    habit_log_tombstone: HabitLogTombstoneTable
    event: EventTable
    project: ProjectTable
    habit_streak_freeze: HabitStreakFreezeTable
}

export interface HabitTable {
    id: string
    nombre: string
    tipo: 'diario_recurrente' | 'diario_unico' | 'semanal' | 'mensual'
    dias_semana: string | null
    fecha: string | null
    hora: string | null
    duracion_minutos: number | null
    color: string | null
    importancia: 'alta' | 'media' | 'baja'
    fecha_inicio: string
    fecha_fin: string | null
    activo: number
    created_at: ColumnType<string, string | undefined, never>
    updated_at: ColumnType<string, string | undefined, string>
}

export interface HabitLogTable {
    id: string
    habit_id: string
    periodo: string
    estado: 'cumplido' | 'no_cumplido' | 'pausado'
    created_at: ColumnType<string, string | undefined, never>
    updated_at: ColumnType<string, string | undefined, string>
}

export interface SettingTable {
    key: string
    value: string
}

export interface HabitPeriodClaimTable {
    id: string
    habit_id: string
    tipo: 'semanal' | 'mensual'
    periodo: string
    xp_otorgado: number
    reclamado_en: ColumnType<string, string | undefined, never>
}

export interface HabitScheduleBlockTable {
    id: string
    habit_id: string
    dias_semana: string
    hora: string
    duracion_minutos: number | null
}

export interface HabitLogTombstoneTable {
    id: string
    habit_id: string
    periodo: string
    deleted_at: ColumnType<string, string | undefined, never>
}

export interface EventTable {
    id: string
    nombre: string
    fecha: string
    notas: string | null
    created_at: ColumnType<string, string | undefined, never>
    updated_at: ColumnType<string, string | undefined, string>
}

export interface ProjectTable {
    id: string
    nombre: string
    deadline: string
    notas: string | null
    estado: 'pendiente' | 'hecho'
    created_at: ColumnType<string, string | undefined, never>
    updated_at: ColumnType<string, string | undefined, string>
}

export interface HabitStreakFreezeTable {
    id: string
    habit_id: string
    milestone_racha: number
    earned_at: ColumnType<string, string | undefined, never>
    consumed_periodo: string | null
    consumed_at: string | null
}
