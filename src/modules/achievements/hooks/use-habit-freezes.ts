import { useQuery } from '@tanstack/react-query'

import { countUnspentFreezes } from '../services/streak-freeze.service'

export function habitFreezesQueryKey(habitId: string) {
    return ['streak-freezes', habitId] as const
}

/** Cuántos freezes (racha protegida) tiene disponibles un hábito ahora mismo, sin gastar. */
export function useHabitFreezes(habitId: string) {
    return useQuery({
        queryKey: habitFreezesQueryKey(habitId),
        queryFn: () => countUnspentFreezes(habitId)
    })
}
