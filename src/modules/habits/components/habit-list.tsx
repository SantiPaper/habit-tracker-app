import { useHabits } from '../hooks/use-habits'
import { useRetireHabit } from '../hooks/use-retire-habit'
import type { HabitImportancia } from '../types/habit.types'

import { HabitListItem } from './habit-list-item'

import { toDateKey } from '@/lib/date/period'

const IMPORTANCIA_ORDEN: Record<HabitImportancia, number> = { alta: 0, media: 1, baja: 2 }

export function HabitList() {
    const { data: habits, isLoading, error } = useHabits()
    const retireHabitMutation = useRetireHabit()

    if (isLoading) return <p className='text-text-muted'>Cargando...</p>
    if (error) return <p className='text-red-400'>Error al cargar hábitos</p>

    const activeHabits = (habits?.filter(habit => habit.activo) ?? []).sort(
        (a, b) => IMPORTANCIA_ORDEN[a.importancia] - IMPORTANCIA_ORDEN[b.importancia]
    )
    if (activeHabits.length === 0) return <p className='text-text-muted'>Todavía no creaste ningún hábito.</p>

    return (
        <ul className='flex flex-col gap-2'>
            {activeHabits.map(habit => (
                <HabitListItem
                    key={habit.id}
                    habit={habit}
                    onDelete={h =>
                        retireHabitMutation.mutate({ habitId: h.id, fechaFin: toDateKey(new Date()), nombre: h.nombre })
                    }
                />
            ))}
        </ul>
    )
}
