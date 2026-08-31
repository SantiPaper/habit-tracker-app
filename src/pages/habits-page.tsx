import { useState } from 'react'

import { HabitForm } from '@/modules/habits/components/habit-form'
import { HabitList } from '@/modules/habits/components/habit-list'

type HabitsSubTab = 'lista' | 'nuevo'

const SUB_TABS: { id: HabitsSubTab; label: string }[] = [
    { id: 'lista', label: 'Hábitos' },
    { id: 'nuevo', label: 'Crear hábito' }
]

export function HabitsPage() {
    const [subTab, setSubTab] = useState<HabitsSubTab>('nuevo')

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-6 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Hábitos</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Hábitos</h2>
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

            {subTab === 'lista' && <HabitList />}
            {subTab === 'nuevo' && <HabitForm />}
        </div>
    )
}
