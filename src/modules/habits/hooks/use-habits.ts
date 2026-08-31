import { useQuery } from '@tanstack/react-query'

import { listHabits } from '../services/habit.service'

export const habitsQueryKey = ['habits'] as const

export function useHabits() {
    return useQuery({
        queryKey: habitsQueryKey,
        queryFn: listHabits
    })
}
