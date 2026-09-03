import type { MouseEvent as ReactMouseEvent } from 'react'
import { useState } from 'react'

import { GRID_HEIGHT_PX, GRID_START_HOUR, HOUR_HEIGHT_PX, minutesToHora } from '../lib/time-grid'

// Antes 30 — no dejaba crear un hábito a las :15/:45 (ej. crear uno de 11:00-11:15 y no poder
// arrancar el siguiente hasta las 11:30). Ahora coincide con el snap del arrastre (DRAG_SNAP_MIN
// en habit-block.tsx), así que ambos caminos ofrecen la misma granularidad.
const SNAP_MIN = 15

export interface OccupiedRange {
    top: number
    bottom: number
}

interface EmptySlotHoverLayerProps {
    onCreateAt: (hora: string) => void
    /** Rangos de píxeles (alto real ya renderizado de cada `HabitBlock`, con su piso de legibilidad
     * incluido) que el hover NUNCA debe pisar — sin esto, el snap a 30min (más grueso que un bloque
     * corto) podía dejar asomar el aviso "+ Crear hábito" pegado a un hábito ya existente. */
    occupiedRanges?: OccupiedRange[]
}

/**
 * Capa invisible detrás de los `HabitBlock` de la grilla — al pasar el mouse por un hueco vacío
 * muestra un "+ Crear hábito HH:MM" en esa altura, redondeado a 30 min. Un click ahí abre
 * `QuickCreateHabitDialog` con esa hora ya cargada.
 */
export function EmptySlotHoverLayer({ onCreateAt, occupiedRanges = [] }: EmptySlotHoverLayerProps) {
    const [hoverTopPx, setHoverTopPx] = useState<number | null>(null)

    function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const snapPx = (SNAP_MIN / 60) * HOUR_HEIGHT_PX
        const snappedY = Math.round(y / snapPx) * snapPx

        // El mouse puede estar en un hueco real, pero el "+ Crear hábito" (SNAP_MIN=30) cae más
        // grueso que un bloque corto — si la franja redondeada pisa cualquier bloque real, no se
        // muestra nada ahí, aunque el punto exacto del mouse esté técnicamente libre.
        const overlapsBlock = occupiedRanges.some(range => snappedY < range.bottom && snappedY + snapPx > range.top)
        setHoverTopPx(overlapsBlock ? null : snappedY)
    }

    const hoveredHora =
        hoverTopPx !== null ? minutesToHora(GRID_START_HOUR * 60 + (hoverTopPx / HOUR_HEIGHT_PX) * 60) : null

    return (
        <div
            className='absolute inset-0'
            style={{ height: GRID_HEIGHT_PX }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverTopPx(null)}
            onClick={() => hoveredHora && onCreateAt(hoveredHora)}
        >
            {hoveredHora && (
                <div
                    className='border-accent/40 text-accent pointer-events-none absolute right-1 left-1 flex items-center gap-1.5 rounded-md border border-dashed px-2 py-1 font-mono text-[11px] font-bold'
                    style={{ top: hoverTopPx! }}
                >
                    <span className='text-sm leading-none'>+</span> Crear hábito · {hoveredHora}
                </div>
            )}
        </div>
    )
}
