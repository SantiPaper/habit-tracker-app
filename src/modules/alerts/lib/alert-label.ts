/** Etiqueta corta de "cuándo" para un `AlertItem`, a partir de `diasHasta` (negativo = vencido). */
export function alertDaysLabel(diasHasta: number): string {
    if (diasHasta < 0) return `Vencido hace ${Math.abs(diasHasta)} día${Math.abs(diasHasta) === 1 ? '' : 's'}`
    if (diasHasta === 0) return 'Hoy'
    if (diasHasta === 1) return 'Mañana'
    return `En ${diasHasta} días`
}
