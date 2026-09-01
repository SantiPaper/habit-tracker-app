import { useState } from 'react'

import { toDateKey } from '@/lib/date/period'
import { DayView } from '@/modules/calendar/components/day-view'
import { ListView } from '@/modules/calendar/components/list-view'
import { MonthView } from '@/modules/calendar/components/month-view'
import { WeekView } from '@/modules/calendar/components/week-view'
import { EventDialog } from '@/modules/events/components/event-dialog'
import { useEventDialogStore } from '@/modules/events/store/event-dialog-store'
import { ProjectDialog } from '@/modules/projects/components/project-dialog'
import { useProjectDialogStore } from '@/modules/projects/store/project-dialog-store'

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
    const openCreateEvent = useEventDialogStore(state => state.openCreate)
    const openCreateProject = useProjectDialogStore(state => state.openCreate)

    const goToDay = (date: Date) => {
        setDayTarget(date)
        setSubTab('dia')
    }

    return (
        <div className='mx-auto flex max-w-7xl flex-col gap-6 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Agenda</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Agenda</h2>
            </div>

            <div className='flex items-center justify-between gap-1.5'>
                <div className='flex gap-1.5'>
                    {SUB_TABS.map(tab => (
                        <button
                            key={tab.id}
                            type='button'
                            onClick={() => setSubTab(tab.id)}
                            className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
                                subTab === tab.id
                                    ? 'bg-accent text-accent-ink'
                                    : 'bg-surface-2 text-text-muted hover:text-text'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className='flex gap-1.5'>
                    <button
                        type='button'
                        onClick={() => openCreateEvent(toDateKey(dayTarget))}
                        className='bg-accent-2 text-accent-ink rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-opacity hover:opacity-90 active:opacity-80'
                    >
                        + Evento
                    </button>
                    <button
                        type='button'
                        onClick={() => openCreateProject(toDateKey(dayTarget))}
                        className='border-accent-2 text-accent-2 hover:bg-accent-2/10 rounded-full border px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-colors'
                    >
                        + Proyecto
                    </button>
                </div>
            </div>

            {subTab === 'lista' && <ListView />}
            {subTab === 'dia' && <DayView key={toDateKey(dayTarget)} initialDate={dayTarget} />}
            {subTab === 'semana' && <WeekView onSelectDay={goToDay} />}
            {subTab === 'mes' && <MonthView onSelectDay={goToDay} />}

            <EventDialog />
            <ProjectDialog />
        </div>
    )
}
