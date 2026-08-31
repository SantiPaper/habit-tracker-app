import { addMonths, format, isSameMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

import type { CalendarDayItem } from '../hooks/use-month-data'
import { getMonthGridDays } from '../lib/month-grid'

import { toDateKey } from '@/lib/date/period'

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

type DayStatus = 'none' | 'future' | 'perfect' | 'partial'

function getDayStatus(items: CalendarDayItem[], dateKey: string, todayKey: string): DayStatus {
    if (items.length === 0) return 'none'
    if (dateKey > todayKey) return 'future'

    const counted = items.filter(item => item.estado !== 'pausado')
    if (counted.length === 0) return 'none'

    const done = counted.filter(item => item.estado === 'cumplido').length
    return done === counted.length ? 'perfect' : 'partial'
}

interface MonthCalendarProps {
    monthAnchor: Date
    onMonthAnchorChange: (date: Date) => void
    data: Map<string, CalendarDayItem[]>
    selectedDateKey: string | null
    onSelectDate: (dateKey: string) => void
}

/** El widget de calendario chico y flotante — vuelve a usarse en la vista Lista de Agenda para navegar días con un click, además de las flechas anterior/siguiente. */
export function MonthCalendar({
    monthAnchor,
    onMonthAnchorChange,
    data,
    selectedDateKey,
    onSelectDate
}: MonthCalendarProps) {
    const days = getMonthGridDays(monthAnchor)
    const todayKey = toDateKey(new Date())

    return (
        <div className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6'>
            <div className='flex items-center justify-between'>
                <button
                    type='button'
                    onClick={() => onMonthAnchorChange(subMonths(monthAnchor, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Mes anterior'
                >
                    ←
                </button>
                <span className='text-text font-mono text-sm font-bold tracking-wider uppercase'>
                    {format(monthAnchor, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                    type='button'
                    onClick={() => onMonthAnchorChange(addMonths(monthAnchor, 1))}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-sm'
                    aria-label='Mes siguiente'
                >
                    →
                </button>
            </div>

            <div className='grid grid-cols-7 gap-1.5'>
                {DIAS_HEADER.map(label => (
                    <div key={label} className='text-text-muted text-center font-mono text-[11px] font-bold uppercase'>
                        {label}
                    </div>
                ))}

                {days.map(day => {
                    const dateKey = toDateKey(day)
                    const items = data.get(dateKey) ?? []
                    const status = getDayStatus(items, dateKey, todayKey)
                    const inMonth = isSameMonth(day, monthAnchor)
                    const isToday = dateKey === todayKey
                    const isSelected = dateKey === selectedDateKey

                    return (
                        <button
                            key={dateKey}
                            type='button'
                            onClick={() => onSelectDate(dateKey)}
                            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm ${
                                isSelected ? 'bg-surface-2 ring-accent ring-1' : ''
                            } ${inMonth ? 'text-text' : 'text-text-muted opacity-40'}`}
                        >
                            <span className={isToday ? 'text-accent font-mono font-bold' : ''}>{format(day, 'd')}</span>
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    status === 'perfect'
                                        ? 'bg-accent'
                                        : status === 'partial'
                                          ? 'bg-accent-2'
                                          : status === 'future'
                                            ? 'border-text-muted border'
                                            : 'bg-transparent'
                                }`}
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
