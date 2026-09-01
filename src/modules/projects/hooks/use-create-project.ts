import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createProject } from '../services/project.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProject,
        onSuccess: newProject => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            useToastStore.getState().addToast('success', `Proyecto "${newProject.nombre}" creado`)
        },
        onError: error => {
            console.error('[create-project] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo crear el proyecto: ${message}`)
        }
    })
}
