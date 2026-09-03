import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'

import {
    GRID_END_HOUR,
    GRID_START_HOUR,
    HOUR_HEIGHT_PX,
    MIN_BLOCK_HEIGHT_PX_COMPACT,
    MIN_BLOCK_HEIGHT_PX_FULL,
    minutesToHora,
    minutesToPx,
    parseHoraToMinutes,
    type BlockGeometry
} from '../lib/time-grid'

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
    /** Tope de alto (px) para no invadir al próximo bloque de la misma columna — ver `maxHeightsByNextInColumn`. `undefined` = sin tope (último de su columna). */
    maxHeightPx?: number
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
const DRAG_SNAP_PX = minutesToPx(DRAG_SNAP_MIN)
/** Un arrastre más chico que esto se descarta como "no fue intencional" (click tembloroso). */
const DRAG_THRESHOLD_PX = 8

/** Un hábito posicionado dentro de la grilla horaria, según `geometry` (top/alto) y la columna que le tocó si se solapa con otro. */
export function HabitBlock({
    habit,
    estado,
    hora,
    duracionMinutos,
    geometry,
    maxHeightPx,
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
    const minHeight = variant === 'full' ? MIN_BLOCK_HEIGHT_PX_FULL : MIN_BLOCK_HEIGHT_PX_COMPACT
    // El piso de legibilidad (minHeight) puede querer más espacio del que hay libre hasta el
    // próximo bloque — maxHeightPx (si vino) manda por encima de eso, nunca al revés: nunca corta
    // por debajo del alto real (geometry.heightPx), maxHeightsByNextInColumn ya lo garantiza.
    const height = Math.min(Math.max(geometry.heightPx, minHeight), maxHeightPx ?? Infinity)
    // Tres niveles según cuánto alto real hay, no solo dos — con MIN_BLOCK_HEIGHT_PX_FULL calibrado
    // a 15min exactos (20px), ni los botones de 24px del nivel "compacto" entran ahí. Por debajo de
    // NORMAL_THRESHOLD_PX no entra el layout normal (nombre en su línea + botones de 36px) sin
    // quedar apretado; por debajo de COMPACT_THRESHOLD_PX tampoco entran los botones chicos — ahí
    // se saca el EstadoToggle del todo y el bloque ENTERO pasa a ser clickeable para ciclar el
    // estado (mismo patrón que ya usa la variante `compact` de Semana), así el tamaño puede ser el
    // real sin inflar nada (reportado por el usuario: un hábito de 15min se veía "más grande de lo
    // que debería", y dos hábitos a 15min de diferencia se separaban en columnas sin necesitarlo).
    const NORMAL_THRESHOLD_PX = 48
    const COMPACT_THRESHOLD_PX = 30
    const isCompactLayout = variant === 'full' && height < NORMAL_THRESHOLD_PX
    const isMicroLayout = variant === 'full' && height < COMPACT_THRESHOLD_PX
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
        setDragOffsetPx(Math.round(rawDelta / DRAG_SNAP_PX) * DRAG_SNAP_PX)
    }

    function handlePointerUp() {
        if (dragStartYRef.current === null) return
        const finalOffset = dragOffsetPx
        dragStartYRef.current = null
        setDragging(false)
        setDragOffsetPx(0)

        if (Math.abs(finalOffset) < DRAG_THRESHOLD_PX || !onDragReschedule) return

        // Convierte el delta de arrastre (px, ya snappeado a un múltiplo de DRAG_SNAP_PX) de vuelta
        // a minutos vía HOUR_HEIGHT_PX — antes asumía 1px = 1min, dejó de ser cierto cuando la
        // grilla se agrandó (HOUR_HEIGHT_PX > 60) para darle más aire a los hábitos cortos.
        const finalOffsetMin = Math.round((finalOffset / HOUR_HEIGHT_PX) * 60)
        const minMinutes = GRID_START_HOUR * 60
        const maxMinutes = GRID_END_HOUR * 60 - (duracionMinutos ?? DRAG_SNAP_MIN)
        const newStartMin = Math.min(maxMinutes, Math.max(minMinutes, parseHoraToMinutes(hora) + finalOffsetMin))
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
                className={`flex h-full w-full items-center overflow-hidden rounded-lg border border-l-4 ${isMicroLayout ? '' : 'justify-between'} ${isCompactLayout ? 'gap-2 px-2 py-0.5' : 'gap-3 px-3 py-1.5'} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${ESTADO_BLOCK_STYLE[estado ?? 'null']} ${flashing ? 'spark-pulse' : ''} ${overdue ? 'importance-alert-pulse' : ''}`}
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
                {isMicroLayout ? (
                    // Ni los botones de 24px del nivel compacto entran acá — todo el bloque cicla el
                    // estado al click (mismo patrón que la variante `compact` de Semana), sin
                    // EstadoToggle, para que el alto pueda ser el real sin inflar nada.
                    <button
                        type='button'
                        onClick={() => onChange?.(cycleEstado(estado))}
                        disabled={!onChange}
                        className='w-full min-w-0 truncate text-left text-[11px] font-semibold disabled:cursor-default'
                    >
                        {habit.nombre}
                        <span className='ml-1.5 font-mono text-[9px] font-normal opacity-70'>{hora}</span>
                    </button>
                ) : (
                    <>
                        {isCompactLayout ? (
                            // Una sola fila: no entra el nombre en su línea + hora/duración debajo +
                            // botones de 36px sin quedar apretado — ver NORMAL_THRESHOLD_PX arriba.
                            <div className='flex min-w-0 flex-1 items-baseline gap-1.5'>
                                <span className='truncate text-[12px] font-semibold'>{habit.nombre}</span>
                                <span className='shrink-0 truncate font-mono text-[9px] opacity-70'>{hora}</span>
                            </div>
                        ) : (
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
                        )}
                        <div className='shrink-0'>
                            <EstadoToggle value={estado} onChange={onChange ?? (() => {})} dense={isCompactLayout} />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
