import { useEffect, useRef, type ReactNode } from 'react'

import { GRID_HEIGHT_PX, HOUR_HEIGHT_PX, HOUR_MARKS, nowLinePx } from '../lib/time-grid'

const GUTTER_WIDTH_PX = 60
const VISIBLE_HEIGHT_PX = 560

export interface TimeGridColumn {
    key: string
    header?: ReactNode
    children: ReactNode
    /** Si es el día de hoy, se dibuja la línea de "ahora" en esta columna. */
    isToday?: boolean
    /** Si se pasa, toda la columna (no solo el encabezado) se vuelve hoverable/clickeable — usado en Semana para saltar a ese día. */
    onSelect?: () => void
}

interface TimeGridShellProps {
    columns: TimeGridColumn[]
}

/**
 * Grilla horaria puramente visual (gutter de horas 6:00–24:00 + N columnas), reusada por Día
 * (1 columna) y Semana (7 columnas). No sabe nada de hábitos ni de React Query — recibe las
 * columnas ya armadas con sus bloques posicionados por el caller.
 */
export function TimeGridShell({ columns }: TimeGridShellProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const now = new Date()
    const nowTop = nowLinePx(now)

    useEffect(() => {
        if (!scrollRef.current) return
        const hasToday = columns.some(c => c.isToday)
        if (!hasToday || nowTop === null) return
        scrollRef.current.scrollTop = Math.max(0, nowTop - 140)
        // Solo al montar: no queremos forzar el scroll cada vez que cambian los datos del día.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className='border-border bg-surface overflow-hidden rounded-2xl border'>
            {columns.some(c => c.header) && (
                <div className='border-border flex border-b' style={{ paddingLeft: GUTTER_WIDTH_PX }}>
                    {columns.map(col => (
                        <div key={col.key} className='min-w-0 flex-1 px-1 py-2.5 text-center'>
                            {col.header}
                        </div>
                    ))}
                </div>
            )}

            <div ref={scrollRef} className='overflow-y-auto' style={{ maxHeight: VISIBLE_HEIGHT_PX }}>
                <div className='flex' style={{ height: GRID_HEIGHT_PX }}>
                    <div className='shrink-0' style={{ width: GUTTER_WIDTH_PX }}>
                        {HOUR_MARKS.map(mark => (
                            <div key={mark.hour} className='relative' style={{ height: HOUR_HEIGHT_PX }}>
                                {/* `top-0 -translate-y-1/2` centra el número EXACTO sobre su línea de grilla
                                    (el borde superior de esta celda) — antes era un offset fijo (-8px) que no
                                    coincidía con la matemática real de posición de los bloques
                                    (`computeBlockGeometry`), así que un hábito a las 13:30 se veía corrido
                                    respecto al "13:00" de al lado aunque estuviera bien ubicado contra la
                                    línea real (reportado por el usuario: "se ve descoordinada la grilla"). */}
                                <span className='text-text absolute top-0 right-2.5 -translate-y-1/2 font-mono text-[13px] font-semibold'>
                                    {mark.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {columns.map(col => (
                        <div
                            key={col.key}
                            onClick={col.onSelect}
                            className={`border-border relative min-w-0 flex-1 border-l ${
                                col.onSelect ? 'hover:bg-surface-2/50 cursor-pointer transition-colors' : ''
                            }`}
                        >
                            {HOUR_MARKS.map(mark => (
                                <div
                                    key={mark.hour}
                                    className='border-border/50 border-t first:border-t-0'
                                    style={{ height: HOUR_HEIGHT_PX }}
                                />
                            ))}

                            {col.isToday && nowTop !== null && (
                                <div
                                    className='bg-accent pointer-events-none absolute right-0 left-0 z-10 h-px'
                                    style={{ top: nowTop }}
                                >
                                    <div className='bg-accent absolute top-1/2 left-0 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full' />
                                </div>
                            )}

                            <div className='absolute inset-0'>{col.children}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
