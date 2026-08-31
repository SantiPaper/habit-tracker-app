export type HabitTipo = 'diario_recurrente' | 'diario_unico' | 'semanal' | 'mensual'
export type HabitImportancia = 'alta' | 'media' | 'baja'

/**
 * Bloque de horario de un hábito recurrente — un hábito puede tener 0, 1 o varios, cada uno con
 * su propio subconjunto de días (siempre dentro de `habit.diasSemana`) y su propia hora/duración.
 * Permite representar horarios distintos según el día (ej. martes distinto al resto) o cortes
 * dentro del mismo día (dos bloques el mismo día con un hueco en el medio). Solo aplica a
 * `diario_recurrente` — los demás tipos siguen usando `hora`/`duracionMinutos` escalares.
 */
export interface HabitScheduleBlock {
    id: string
    diasSemana: number[]
    hora: string
    duracionMinutos: number | null
}

export interface Habit {
    id: string
    nombre: string
    tipo: HabitTipo
    diasSemana: number[] | null
    fecha: string | null
    hora: string | null
    duracionMinutos: number | null
    /** Bloques de horario — solo para `diario_recurrente`. Vacío en los demás tipos. */
    scheduleBlocks: HabitScheduleBlock[]
    /** Color libre elegido por el usuario — identidad visual del hábito, no tiene un significado fijo. */
    color: string | null
    /** Nivel de importancia — se usa para ordenar la lista y mostrar una etiqueta, no afecta el color. */
    importancia: HabitImportancia
    fechaInicio: string
    fechaFin: string | null
    activo: boolean
}
