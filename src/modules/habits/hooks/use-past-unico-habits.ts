import { useQuery } from '@tanstack/react-query'

import { listPastUnicoHabitNames } from '../services/habit.service'

export function usePastUnicoHabits() {
    return useQuery({
        queryKey: ['habits', 'past-unico'],
        queryFn: listPastUnicoHabitNames
    })
}
