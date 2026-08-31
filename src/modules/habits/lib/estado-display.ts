import type { EstadoLog } from '../types/habit-log.types'

export const ESTADO_LABELS: Record<EstadoLog, string> = {
    cumplido: 'CUMPLIDO',
    no_cumplido: 'NO CUMPLIDO',
    pausado: 'PAUSADO'
}

export const ESTADO_COLORS: Record<EstadoLog, string> = {
    cumplido: 'text-accent',
    no_cumplido: 'text-text-muted',
    pausado: 'text-accent-2'
}

/**
 * Estilo de tarjeta para los bloques de la grilla horaria (Día/Semana), por estado — `'null'` es
 * "todavía sin tocar". `cumplido` se mantiene oscuro (no invierte a fondo claro) — el detalle que
 * lo distingue es el borde de acento + el glow sutil que agrega `habit-block.tsx` en la variante
 * completa, no un cambio de fondo.
 */
export const ESTADO_BLOCK_STYLE: Record<'null' | EstadoLog, string> = {
    null: 'bg-surface border-border border-dashed text-text-muted',
    cumplido: 'bg-surface border-accent text-text',
    no_cumplido: 'bg-surface-2 border-text-muted text-text',
    pausado: 'bg-accent-2/70 border-accent-2 text-accent-ink'
}

// "pausado" sigue siendo un estado válido para datos viejos (por eso ESTADO_LABELS/COLORS/
// BLOCK_STYLE lo mantienen), pero ya no se puede volver a marcar desde la UI — ni acá ni en
// EstadoToggle. Un chip que hoy esté en pausado cicla a "cumplido" como cualquier otro estado
// desconocido, en vez de quedarse trabado ahí.
const CICLO: (EstadoLog | null)[] = ['cumplido', 'no_cumplido', null]

/** Próximo estado en el ciclo cumplido → no_cumplido → sin marcar → cumplido — usado por los bloques compactos de la grilla horaria (un click cicla en vez de elegir entre botones). */
export function cycleEstado(current: EstadoLog | null): EstadoLog | null {
    const index = CICLO.indexOf(current)
    if (index === -1) return 'cumplido'
    return CICLO[(index + 1) % CICLO.length]
}
