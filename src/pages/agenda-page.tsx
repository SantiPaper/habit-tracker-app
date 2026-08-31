import { useState } from 'react'

import { toDateKey } from '@/lib/date/period'
import { DayView } from '@/modules/calendar/components/day-view'
import { ListView } from '@/modules/calendar/components/list-view'
import { MonthView } from '@/modules/calendar/components/month-view'
import { WeekView } from '@/modules/calendar/components/week-view'

type AgendaSubTab = 'lista' | 'dia' | 'semana' | 'mes'

const SUB_TABS: { id: AgendaSubTab; label: string }[] = [
    { id: 'lista', label: 'Lista' },
    { id: 'dia', label: 'Día' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' }
]

export function AgendaPage() {
    const [subTab, setSubTab] = useState<AgendaSubTab>('dia')
    const [dayTarget, setDayTarget] = useState<Date>(() => new Date())

    const goToDay = (date: Date) => {
        setDayTarget(date)
        setSubTab('dia')
    }

    return (
        <div
            className={`mx-auto flex flex-col gap-6 p-10 ${
                subTab === 'lista' ? 'max-w-6xl' : subTab === 'dia' ? 'max-w-7xl' : 'max-w-4xl'
            }`}
        >
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Agenda</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Agenda</h2>
            </div>

            <div className='flex gap-1.5'>
                {SUB_TABS.map(tab => (
                    <button
                        key={tab.id}
                        type='button'
                        onClick={() => setSubTab(tab.id)}
                        className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase ${
                            subTab === tab.id ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-text-muted'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {subTab === 'lista' && <ListView />}
            {subTab === 'dia' && <DayView key={toDateKey(dayTarget)} initialDate={dayTarget} />}
            {subTab === 'semana' && <WeekView onSelectDay={goToDay} />}
            {subTab === 'mes' && <MonthView onSelectDay={goToDay} />}
        </div>
    )
}
