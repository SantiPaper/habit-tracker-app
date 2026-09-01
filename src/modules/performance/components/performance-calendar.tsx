import { addMonths, format, isSameMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

import { PerformanceDayCell } from './performance-day-cell'

import { toDateKey } from '@/lib/date/period'
import { getMonthGridDays } from '@/modules/calendar/lib/month-grid'
import { useMonthlyPerformance } from '@/modules/performance/hooks/use-monthly-performance'

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function PerformanceCalendar() {
    const [monthAnchor, setMonthAnchor] = useState(new Date())
    const { data, isLoading } = useMonthlyPerformance(monthAnchor)
    const days = getMonthGridDays(monthAnchor)
    const todayKey = toDateKey(new Date())

    const byDate = new Map((data ?? []).map(completion => [completion.dateKey, completion]))
    const withData = (data ?? []).filter(c => c.pct !== null && c.dateKey <= todayKey)
    const promedio =
        withData.length > 0 ? Math.round(withData.reduce((sum, c) => sum + (c.pct ?? 0), 0) / withData.length) : null

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
                <button
                    type='button'
                    onClick={() => setMonthAnchor(a => subMonths(a, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Mes anterior'
                >
                    ←
                </button>
                <div className='flex flex-col items-center gap-0.5'>
                    <span className='text-text font-mono text-sm font-bold tracking-wider uppercase'>
                        {format(monthAnchor, 'MMMM yyyy', { locale: es })}
                    </span>
                    {promedio !== null && (
                        <span className='text-text-muted font-mono text-[11px]'>Promedio del mes: {promedio}%</span>
                    )}
                </div>
                <button
                    type='button'
                    onClick={() => setMonthAnchor(a => addMonths(a, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Mes siguiente'
                >
                    →
                </button>
            </div>

            {isLoading && <p className='text-text-muted'>Cargando...</p>}

            {data && (
                <div className='grid grid-cols-7 gap-1.5'>
                    {DIAS_HEADER.map(label => (
                        <div
                            key={label}
                            className='text-text-muted text-center font-mono text-[11px] font-bold uppercase'
                        >
                            {label}
                        </div>
                    ))}

                    {days.map(day => {
                        const dateKey = toDateKey(day)
                        return (
                            <PerformanceDayCell
                                key={dateKey}
                                date={day}
                                completion={byDate.get(dateKey) ?? null}
                                inMonth={isSameMonth(day, monthAnchor)}
                                isToday={dateKey === todayKey}
                            />
                        )
                    })}
                </div>
            )}

            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1.5'>
                    <span className='h-2.5 w-2.5 rounded-full bg-red-500 opacity-55' />
                    <span className='text-text-muted text-xs'>Menos de 50%</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    <span className='h-2.5 w-2.5 rounded-full bg-amber-500 opacity-55' />
                    <span className='text-text-muted text-xs'>50-99%</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    <span className='h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-55' />
                    <span className='text-text-muted text-xs'>Día perfecto</span>
                </div>
            </div>
        </div>
    )
}
