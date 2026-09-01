import { format } from 'date-fns'

import type { DailyCompletion } from '../lib/daily-completion'

import { toDateKey } from '@/lib/date/period'

interface PerformanceDayCellProps {
    date: Date
    completion: DailyCompletion | null
    inMonth: boolean
    isToday: boolean
}

/**
 * Celda del heatmap: color por tramo (rojo &lt;50%, ámbar 50-99%, verde 100%) + un relleno que
 * sube desde abajo hasta el % exacto — dos señales a la vez, como pidió el usuario ("te guiás por
 * el color y por qué tan completo está el cuadrado"). Días futuros o sin nada programado quedan
 * neutros — no hay dato todavía, no es lo mismo que "0% cumplido".
 */
export function PerformanceDayCell({ date, completion, inMonth, isToday }: PerformanceDayCellProps) {
    const dateKey = toDateKey(date)
    const isFuture = dateKey > toDateKey(new Date())
    const pct = !isFuture ? (completion?.pct ?? null) : null
    const hasData = pct !== null

    const tierClass = pct === null ? '' : pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div
            title={hasData ? `${format(date, 'd/MM')} — ${pct}% cumplido` : format(date, 'd/MM')}
            className={`border-border relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border ${
                isToday ? 'ring-accent ring-2' : ''
            } ${inMonth ? '' : 'opacity-40'}`}
        >
            {hasData && (
                <div
                    className={`absolute inset-x-0 bottom-0 ${tierClass} opacity-55 transition-[height]`}
                    style={{ height: `${pct}%` }}
                />
            )}
            <span className={`relative z-10 font-mono text-xs font-bold ${isToday ? 'text-accent' : 'text-text'}`}>
                {format(date, 'd')}
            </span>
            {hasData && <span className='text-text-muted relative z-10 font-mono text-[9px]'>{pct}%</span>}
        </div>
    )
}
