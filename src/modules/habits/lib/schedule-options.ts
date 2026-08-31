/** Horarios en incrementos de 15 minutos, cubriendo el día completo — "05:00", "05:15", ... "23:45". */
export const TIME_OPTIONS: string[] = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4)
    const minute = (i % 4) * 15
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

/** Duraciones en incrementos de 15 minutos, de 15 min a 4 horas. */
export const DURATION_OPTIONS: number[] = Array.from({ length: 16 }, (_, i) => (i + 1) * 15)

export function formatDuration(minutos: number): string {
    if (minutos < 60) return `${minutos} min`
    const horas = Math.floor(minutos / 60)
    const resto = minutos % 60
    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}
