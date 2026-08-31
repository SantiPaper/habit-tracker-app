import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setImportanciaColor } from '../services/importancia-colors.service'

import { importanciaColorsQueryKey } from './use-importancia-colors'

import { useToastStore } from '@/core/stores/toast-store'
import type { HabitImportancia } from '@/modules/habits/types/habit.types'

export function useSetImportanciaColor() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ nivel, color }: { nivel: HabitImportancia; color: string }) => setImportanciaColor(nivel, color),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: importanciaColorsQueryKey })
        },
        onError: error => {
            console.error('[set-importancia-color] failed', error)
            useToastStore.getState().addToast('error', 'No se pudo guardar el color')
        }
    })
}
