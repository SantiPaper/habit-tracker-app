import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setProjectEstado } from '../services/project.service'
import type { ProjectEstado } from '../types/project.types'

export function useSetProjectEstado() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, estado }: { projectId: string; estado: ProjectEstado }) =>
            setProjectEstado(projectId, estado),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: error => {
            console.error('[set-project-estado] failed', error)
        }
    })
}
