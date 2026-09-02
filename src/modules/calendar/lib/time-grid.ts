export const GRID_START_HOUR = 6
export const GRID_END_HOUR = 24
export const HOUR_HEIGHT_PX = 60
/** Duración visual para un hábito sin `duracionMinutos` — solo afecta el alto del bloque, no se guarda en ningún lado. */
export const DEFAULT_VISUAL_DURATION_MIN = 45

/**
 * Alto mínimo (px) de un bloque en cada variante — sin esto, un hábito de pocos minutos queda tan
 * bajito que el nombre y los botones de Cumplido/No cumplido/Reset no entran bien. Como
 * `HOUR_HEIGHT_PX` es 60 (1px = 1min exacto), este mismo número sirve como "duración visual
 * mínima en minutos" al armar `layoutOverlaps` — si no se usara ahí también, dos hábitos cortos y
 * consecutivos (que no se solapan en su horario REAL) podrían terminar solapados en pantalla
 * porque el alto inflado de uno invade el espacio del siguiente (bug real, reportado por el
 * usuario: "cuando es muy chico el hábito no se ve bien los botones").
 */
export const MIN_BLOCK_HEIGHT_PX_FULL = 54
export const MIN_BLOCK_HEIGHT_PX_COMPACT = 30

const GRID_START_MIN = GRID_START_HOUR * 60
const GRID_END_MIN = GRID_END_HOUR * 60
export const GRID_HEIGHT_PX = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT_PX

export function parseHoraToMinutes(hora: string): number {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m
}

/** Inverso de `parseHoraToMinutes` — usado al convertir un arrastre (delta en px = delta en min) de vuelta a `"HH:MM"`. */
export function minutesToHora(totalMinutes: number): string {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes))
    const h = Math.floor(clamped / 60)
    const m = clamped % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export interface BlockGeometry {
    topPx: number
    heightPx: number
}

/** Posición/alto de un bloque dentro de la grilla, clampeado a sus bordes (6:00–24:00). */
export function computeBlockGeometry(hora: string, duracionMinutos: number | null): BlockGeometry {
    const startMin = Math.max(GRID_START_MIN, parseHoraToMinutes(hora))
    const endMin = Math.min(GRID_END_MIN, startMin + (duracionMinutos ?? DEFAULT_VISUAL_DURATION_MIN))

    const topPx = ((startMin - GRID_START_MIN) / 60) * HOUR_HEIGHT_PX
    const heightPx = Math.max(0, ((endMin - startMin) / 60) * HOUR_HEIGHT_PX)

    return { topPx, heightPx }
}

export const HOUR_MARKS: { hour: number; label: string }[] = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR },
    (_, i) => {
        const hour = GRID_START_HOUR + i
        return { hour, label: `${hour.toString().padStart(2, '0')}:00` }
    }
)

/** Posición vertical (px) de "ahora" dentro de la grilla, o `null` si cae fuera del rango 6:00–24:00. */
export function nowLinePx(now: Date): number | null {
    const minutes = now.getHours() * 60 + now.getMinutes()
    if (minutes < GRID_START_MIN || minutes > GRID_END_MIN) return null
    return ((minutes - GRID_START_MIN) / 60) * HOUR_HEIGHT_PX
}

export interface TimedItem {
    startMin: number
    endMin: number
}

export interface LaidOutItem<T extends TimedItem> {
    item: T
    column: number
    columnCount: number
}

/**
 * Asigna una columna a cada ítem para que los que se solapan en el tiempo queden lado a lado en
 * vez de superpuestos. Algoritmo greedy estándar por clusters de eventos solapados: dentro de un
 * cluster, cada ítem toma la primera columna libre (cuyo último evento ya terminó); el cluster
 * completo comparte la misma cantidad de columnas para que el ancho se reparta parejo.
 */
export function layoutOverlaps<T extends TimedItem>(items: T[]): LaidOutItem<T>[] {
    const sorted = [...items].sort((a, b) => a.startMin - b.startMin)
    const result: LaidOutItem<T>[] = []

    let cluster: T[] = []
    let clusterEnd = -Infinity

    const flushCluster = () => {
        if (cluster.length === 0) return

        const columnEnds: number[] = []
        const assigned: { item: T; column: number }[] = []

        for (const item of cluster) {
            let column = columnEnds.findIndex(end => end <= item.startMin)
            if (column === -1) {
                column = columnEnds.length
                columnEnds.push(item.endMin)
            } else {
                columnEnds[column] = item.endMin
            }
            assigned.push({ item, column })
        }

        const columnCount = columnEnds.length
        for (const { item, column } of assigned) result.push({ item, column, columnCount })
        cluster = []
    }

    for (const item of sorted) {
        if (cluster.length > 0 && item.startMin >= clusterEnd) {
            flushCluster()
            clusterEnd = -Infinity
        }
        cluster.push(item)
        clusterEnd = Math.max(clusterEnd, item.endMin)
    }
    flushCluster()

    return result
}
