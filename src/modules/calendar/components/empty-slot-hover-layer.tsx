import type { MouseEvent as ReactMouseEvent } from 'react'
import { useState } from 'react'

import { GRID_HEIGHT_PX, GRID_START_HOUR, HOUR_HEIGHT_PX, minutesToHora } from '../lib/time-grid'

const SNAP_MIN = 30

interface EmptySlotHoverLayerProps {
    onCreateAt: (hora: string) => void
}

/**
 * Capa invisible detrás de los `HabitBlock` de la grilla — al pasar el mouse por un hueco vacío
 * (los bloques, que se dibujan encima, tapan esta capa donde ya hay algo, así que el hover nunca
 * aparece sobre un hábito existente) muestra un "+ Crear hábito HH:MM" en esa altura, redondeado
 * a 30 min. Un click ahí abre `QuickCreateHabitDialog` con esa hora ya cargada.
 */
export function EmptySlotHoverLayer({ onCreateAt }: EmptySlotHoverLayerProps) {
    const [hoverTopPx, setHoverTopPx] = useState<number | null>(null)

    function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const snapPx = (SNAP_MIN / 60) * HOUR_HEIGHT_PX
        setHoverTopPx(Math.round(y / snapPx) * snapPx)
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
