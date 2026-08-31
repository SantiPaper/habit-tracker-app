import type { HabitImportancia } from '@/modules/habits/types/habit.types'

export type ImportanciaColors = Record<HabitImportancia, string>

/** Colores por defecto — el usuario los puede cambiar desde Perfil. */
export const DEFAULT_IMPORTANCIA_COLORS: ImportanciaColors = {
    alta: '#f87171',
    media: '#fbbf24',
    baja: '#60a5fa'
}
