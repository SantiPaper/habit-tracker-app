import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'

import { GRID_END_HOUR, GRID_START_HOUR, minutesToHora, parseHoraToMinutes, type BlockGeometry } from '../lib/time-grid'

import { EstadoToggle } from '@/components/estado-toggle'
import { useFlashOnTrue } from '@/lib/hooks/use-flash-on-true'
import { useNow } from '@/lib/hooks/use-now'
import { CumplidoBadge } from '@/modules/habits/components/cumplido-badge'
import { ImportanciaLabel } from '@/modules/habits/components/importancia-label'
import { ESTADO_BLOCK_STYLE, cycleEstado } from '@/modules/habits/lib/estado-display'
import { isImportanceOverdue } from '@/modules/habits/lib/importance-alert'
import type { ScheduleSlot } from '@/modules/habits/lib/schedule-blocks'
import type { EstadoLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'
import { useImportanciaColors } from '@/modules/profile/hooks/use-importancia-colors'

interface HabitBlockProps {
    habit: Habit
    estado: EstadoLog | null
    /** Hora/duración de ESTE bloque puntual — un hábito recurrente puede tener varios el mismo día. */
    hora: string
    duracionMinutos: number | null
    geometry: BlockGeometry
    column: number
    columnCount: number
    variant: 'full' | 'compact'
    /** Si no se pasa, el bloque se muestra de solo lectura (usado en Semana/Mes — solo Día permite tildar). */
    onChange?: (estado: EstadoLog | null) => void
    /** Solo Día lo pasa — habilita el destello al completar y la alerta de importancia alta atrasada. */
    isToday?: boolean
    /** Todos los bloques de hoy del hábito (no solo este) — para que la alerta de atrasado mire el último del día. */
    blocksToday?: ScheduleSlot[]
    /** Habilita arrastrar verticalmente para cambiar la hora — solo lo pasa Día (variant `full`). */
    draggable?: boolean
    /** Se llama al soltar, con la hora nueva ya redondeada a 15 min — no persiste nada por sí solo. */
    onDragReschedule?: (newHora: string) => void
}

const DRAG_SNAP_MIN = 15
/** Un arrastre más chico que esto se descarta como "no fue intencional" (click tembloroso). */
const DRAG_THRESHOLD_PX = 8

/** Un hábito posicionado dentro de la grilla horaria, según `geometry` (top/alto) y la columna que le tocó si se solapa con otro. */
export function HabitBlock({
    habit,
    estado,
    hora,
    duracionMinutos,
    geometry,
    column,
    columnCount,
    variant,
    onChange,
    isToday,
    blocksToday,
    draggable,
    onDragReschedule
}: HabitBlockProps) {
    const flashing = useFlashOnTrue(estado === 'cumplido')
    const now = useNow()
    const { data: importanciaColors } = useImportanciaColors()
    const overdue = isToday === true && isImportanceOverdue(habit, estado, now, blocksToday ?? [])
    const minHeight = variant === 'full' ? 54 : 30
    const height = Math.max(geometry.heightPx, minHeight)
    const widthPercent = 100 / columnCount

    const [dragOffsetPx, setDragOffsetPx] = useState(0)
    const [dragging, setDragging] = useState(false)
    const dragStartYRef = useRef<number | null>(null)

    function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
        if (!draggable) return
        // No arrancar un arrastre si el click empezó en un botón de adentro (EstadoToggle) — ese ya tiene su propio click.
        if ((e.target as HTMLElement).closest('button')) return
        dragStartYRef.current = e.clientY
        setDragging(true)
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (dragStartYRef.current === null) return
        const rawDelta = e.clientY - dragStartYRef.current
        setDragOffsetPx(Math.round(rawDelta / DRAG_SNAP_MIN) * DRAG_SNAP_MIN)
    }

    function handlePointerUp() {
        if (dragStartYRef.current === null) return
        const finalOffset = dragOffsetPx
        dragStartYRef.current = null
        setDragging(false)
        setDragOffsetPx(0)

        if (Math.abs(finalOffset) < DRAG_THRESHOLD_PX || !onDragReschedule) return

        // 1px de la grilla = 1 minuto (ver time-grid.ts) — el delta de arrastre ya viene snappeado a 15.
        const minMinutes = GRID_START_HOUR * 60
        const maxMinutes = GRID_END_HOUR * 60 - (duracionMinutos ?? DRAG_SNAP_MIN)
        const newStartMin = Math.min(maxMinutes, Math.max(minMinutes, parseHoraToMinutes(hora) + finalOffset))
        onDragReschedule(minutesToHora(newStartMin))
    }

    const wrapperStyle: CSSProperties = {
        position: 'absolute',
        top: geometry.topPx,
        height,
        left: `${widthPercent * column}%`,
        width: `${widthPercent}%`,
        boxSizing: 'border-box',
        padding: '0 2px',
        transform: dragOffsetPx ? `translateY(${dragOffsetPx}px)` : undefined,
        zIndex: dragging ? 10 : undefined,
        touchAction: draggable ? 'none' : undefined
    }

    if (variant === 'compact') {
        const cardClass = `flex h-full w-full flex-col overflow-hidden rounded-md border border-l-[3px] px-1.5 py-1 text-left ${ESTADO_BLOCK_STYLE[estado ?? 'null']}`
        const cardStyle: CSSProperties | undefined = habit.color ? { borderLeftColor: habit.color } : undefined
        const content = (
            <>
                <span className='truncate text-[10px] leading-tight font-semibold'>{habit.nombre}</span>
                <span className='font-mono text-[9px] leading-tight opacity-80'>{hora}</span>
            </>
        )

        return (
            <div style={wrapperStyle}>
                {onChange ? (
                    <button
                        type='button'
                        onClick={() => onChange(cycleEstado(estado))}
                        className={cardClass}
                        style={cardStyle}
                        title={`${habit.nombre} · ${hora}`}
                    >
                        {content}
                    </button>
                ) : (
                    <div className={cardClass} style={cardStyle} title={`${habit.nombre} · ${hora}`}>
                        {content}
                    </div>
                )}
            </div>
        )
    }

    const alertColor = importanciaColors?.alta

    return (
        <div
            style={wrapperStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div
                className={`flex h-full w-full items-center justify-between gap-3 overflow-hidden rounded-lg border border-l-4 px-3 py-1.5 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${ESTADO_BLOCK_STYLE[estado ?? 'null']} ${flashing ? 'spark-pulse' : ''} ${overdue ? 'importance-alert-pulse' : ''}`}
                style={
                    {
                        ...(habit.color ? { borderLeftColor: habit.color } : undefined),
                        ...(estado === 'cumplido'
                            ? { boxShadow: '0 0 16px color-mix(in oklch, var(--color-accent) 20%, transparent)' }
                            : undefined),
                        ...(flashing ? { '--spark-color': habit.color ?? 'var(--color-accent)' } : undefined),
                        ...(overdue && alertColor ? { '--alert-color': alertColor } : undefined)
                    } as CSSProperties
                }
            >
                <div className='flex min-w-0 flex-col gap-0.5'>
                    <div className='flex min-w-0 items-center gap-1.5'>
                        <span className='truncate text-[13px] font-semibold'>{habit.nombre}</span>
                        <ImportanciaLabel importancia={habit.importancia} />
                        {estado === 'cumplido' && <CumplidoBadge />}
                    </div>
                    <span className='truncate font-mono text-[10px] opacity-80'>
                        {hora}
                        {duracionMinutos ? ` · ${duracionMinutos} min` : ''}
                    </span>
                </div>
                <div className='shrink-0'>
                    <EstadoToggle value={estado} onChange={onChange ?? (() => {})} />
                </div>
            </div>
        </div>
    )
}
