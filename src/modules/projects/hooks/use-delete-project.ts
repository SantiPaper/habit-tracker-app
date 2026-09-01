import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteProject } from '../services/project.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            useToastStore.getState().addToast('success', 'Proyecto eliminado')
        },
        onError: error => {
            console.error('[delete-project] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo eliminar el proyecto: ${message}`)
        }
    })
}
