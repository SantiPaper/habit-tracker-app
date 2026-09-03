export const GRID_START_HOUR = 6
export const GRID_END_HOUR = 24
// Antes 60 (1px = 1min exacto) — el usuario pidió más aire para hábitos de 15/30min, que quedaban
// muy apretados. Ya no hay una equivalencia 1:1 con los minutos: cualquier conversión px↔min tiene
// que pasar por este valor explícitamente (ver minutesToPx más abajo) — no asumirla en ningún lado.
export const HOUR_HEIGHT_PX = 80

/**
 * Alto mínimo (px, SIEMPRE en píxeles — no confundir con minutos) de un bloque en cada variante.
 * `habit-block.tsx` lo usa directo para el alto real renderizado; `maxHeightsByNextInColumn` (más
 * abajo) es quien evita que ese piso invada al próximo bloque. 20px = exactamente 15min reales con
 * HOUR_HEIGHT_PX=80 — no es un número arbitrario, es el mínimo de la grilla (mismo que el snap de
 * arrastre/quick-create). Por debajo de ese tamaño ni los botones más chicos entran (ver
 * COMPACT_THRESHOLD_PX en habit-block.tsx) — ahí el bloque entero pasa a ciclar el estado al click,
 * sin EstadoToggle, así el alto puede ser el real sin inflar nada (pedido explícito del usuario: un
 * hábito de 15min se veía "más grande de lo que le corresponde").
 */
export const MIN_BLOCK_HEIGHT_PX_FULL = 20
export const MIN_BLOCK_HEIGHT_PX_COMPACT = 30

const GRID_START_MIN = GRID_START_HOUR * 60
const GRID_END_MIN = GRID_END_HOUR * 60
export const GRID_HEIGHT_PX = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT_PX

/** Conversión explícita minutos→píxeles de grilla — usar esto en vez de asumir 1px = 1min en ningún lado (dejó de ser cierto cuando HOUR_HEIGHT_PX pasó a valer más de 60). */
export function minutesToPx(minutes: number): number {
    return (minutes / 60) * HOUR_HEIGHT_PX
}

/** Inversa de `minutesToPx`. */
function pxToMinutes(px: number): number {
    return (px / HOUR_HEIGHT_PX) * 60
}

/**
 * "Duración mínima de layout" — cuántos minutos reales de hueco necesita un bloque para renderizar
 * su piso de legibilidad (`MIN_BLOCK_HEIGHT_PX_FULL/COMPACT`) SIN comprimirse por debajo de él. Se
 * usa como piso al calcular solapamientos (`layoutOverlaps`, en day-view.tsx/week-view.tsx) — dos
 * hábitos de 15min separados por solo 15min reales no entran parados uno debajo del otro sin que
 * `maxHeightsByNextInColumn` los aplaste por debajo de su propio mínimo (bug real, reportado por
 * el usuario: "cree dos de 15 minutos y no hay espacio"). Tratarlos como si "ocuparan" este mínimo
 * (en vez de su duración real, más corta) hace que `layoutOverlaps` los mande a columnas separadas
 * en vez de apilarlos rotos — mismo mecanismo que ya usa para solapamientos de horario reales.
 */
export const MIN_BLOCK_DURATION_MIN_FULL = Math.ceil(pxToMinutes(MIN_BLOCK_HEIGHT_PX_FULL))
export const MIN_BLOCK_DURATION_MIN_COMPACT = Math.ceil(pxToMinutes(MIN_BLOCK_HEIGHT_PX_COMPACT))

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

/**
 * Posición/alto de un bloque dentro de la grilla, clampeado a sus bordes (6:00–24:00). Sin
 * `duracionMinutos` (el usuario cargó la hora pero no cuánto dura) el bloque no inventa una
 * duración — ocupa el alto real 0, y es `MIN_BLOCK_HEIGHT_PX_FULL/COMPACT` en `HabitBlock` el que
 * le da el mínimo legible. Antes se le asignaban 45min falsos ("duración visual por defecto"), lo
 * que mentía sobre cuánto dura Y ensuciaba `layoutOverlaps` (podía "chocar" con algo que en
 * realidad no se solapaba) — decisión del usuario: un hábito sin duración conocida no debería
 * poder ocupar más que el mínimo en la grilla.
 */
export function computeBlockGeometry(hora: string, duracionMinutos: number | null): BlockGeometry {
    const startMin = Math.max(GRID_START_MIN, parseHoraToMinutes(hora))
    const endMin = Math.min(GRID_END_MIN, startMin + (duracionMinutos ?? 0))

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

/**
 * Para cada ítem ya ubicado por `layoutOverlaps`, el alto máximo EN PÍXELES que puede ocupar sin
 * invadir al próximo ítem de SU MISMA columna (convertido desde la diferencia en minutos vía
 * `minutesToPx` — nunca asumir 1px = 1min acá). Sirve para que `HabitBlock` pueda crecer hasta su
 * alto mínimo de legibilidad (ver `MIN_BLOCK_HEIGHT_PX_FULL/COMPACT`) sin pisar visualmente al
 * siguiente — sin esto, dos hábitos cortos que en su horario real NO se solapan (ej. uno termina a
 * las 08:15 y el otro arranca a las 08:30) quedaban con sus cajas invadiéndose igual, porque el
 * alto mínimo por legibilidad de uno se extendía más allá de su horario real (bug reportado por el
 * usuario, con captura). Devuelve `undefined` para el último ítem de cada columna (nada después que
 * lo limite en ese carril).
 */
export function maxHeightsByNextInColumn<T extends TimedItem>(laidOut: LaidOutItem<T>[]): (number | undefined)[] {
    const indicesByColumn = new Map<number, number[]>()
    laidOut.forEach((entry, index) => {
        const list = indicesByColumn.get(entry.column)
        if (list) list.push(index)
        else indicesByColumn.set(entry.column, [index])
    })

    const result: (number | undefined)[] = new Array(laidOut.length).fill(undefined)
    for (const indices of indicesByColumn.values()) {
        indices.sort((a, b) => laidOut[a].item.startMin - laidOut[b].item.startMin)
        for (let i = 0; i < indices.length - 1; i++) {
            const current = indices[i]
            const next = indices[i + 1]
            result[current] = minutesToPx(laidOut[next].item.startMin - laidOut[current].item.startMin)
        }
    }
    return result
}
