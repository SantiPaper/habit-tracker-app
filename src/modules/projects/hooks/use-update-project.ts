import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateProject, type UpdateProjectInput } from '../services/project.service'

import { useToastStore } from '@/core/stores/toast-store'

export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) =>
            updateProject(projectId, input),
        onSuccess: updated => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            useToastStore.getState().addToast('success', `Proyecto "${updated.nombre}" actualizado`)
        },
        onError: error => {
            console.error('[update-project] failed', error)
            const message = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast('error', `No se pudo actualizar el proyecto: ${message}`)
        }
    })
}
