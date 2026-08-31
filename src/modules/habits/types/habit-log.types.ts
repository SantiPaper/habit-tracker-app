export type EstadoLog = 'cumplido' | 'no_cumplido' | 'pausado'

export interface HabitLog {
    id: string
    habitId: string
    periodo: string
    estado: EstadoLog
}
