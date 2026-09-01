import { useState } from 'react'

import { useCreateProject } from '../hooks/use-create-project'
import { useDeleteProject } from '../hooks/use-delete-project'
import { useSetProjectEstado } from '../hooks/use-set-project-estado'
import { useUpdateProject } from '../hooks/use-update-project'
import { useProjectDialogStore } from '../store/project-dialog-store'
import type { Project } from '../types/project.types'

import { DatePickerField } from '@/components/date-picker-field'

/** Diálogo único para crear y editar Proyectos — mismo criterio que `EventDialog`: lo bastante simple como para no justificar un formulario y un diálogo de edición separados. */
export function ProjectDialog() {
    const target = useProjectDialogStore(state => state.target)
    const close = useProjectDialogStore(state => state.close)

    if (!target) return null

    return <ProjectDialogContent target={target} onClose={close} />
}

function ProjectDialogContent({
    target,
    onClose
}: {
    target: { mode: 'create'; defaultDeadline: string } | { mode: 'edit'; project: Project }
    onClose: () => void
}) {
    const isEdit = target.mode === 'edit'
    const [nombre, setNombre] = useState(isEdit ? target.project.nombre : '')
    const [deadline, setDeadline] = useState(isEdit ? target.project.deadline : target.defaultDeadline)
    const [notas, setNotas] = useState(isEdit ? (target.project.notas ?? '') : '')
    const [error, setError] = useState<string | null>(null)

    const createProjectMutation = useCreateProject()
    const updateProjectMutation = useUpdateProject()
    const deleteProjectMutation = useDeleteProject()
    const setEstadoMutation = useSetProjectEstado()

    const saving = createProjectMutation.isPending || updateProjectMutation.isPending
    const deleting = deleteProjectMutation.isPending
    const togglingEstado = setEstadoMutation.isPending

    async function handleSave() {
        setError(null)
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }
        if (!deadline) {
            setError('La fecha límite es obligatoria')
            return
        }

        const input = { nombre: nombre.trim(), deadline, notas: notas.trim() || null }

        if (isEdit) {
            await updateProjectMutation.mutateAsync({ projectId: target.project.id, input })
        } else {
            await createProjectMutation.mutateAsync(input)
        }
        onClose()
    }

    async function handleDelete() {
        if (!isEdit) return
        await deleteProjectMutation.mutateAsync(target.project.id)
        onClose()
    }

    async function handleToggleEstado() {
        if (!isEdit) return
        await setEstadoMutation.mutateAsync({
            projectId: target.project.id,
            estado: target.project.estado === 'hecho' ? 'pendiente' : 'hecho'
        })
        onClose()
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
            <div
                className='border-border bg-surface flex w-[400px] flex-col rounded-2xl border'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-4 p-6'>
                    <span className='text-accent-2 font-mono text-xs font-bold tracking-widest uppercase'>
                        {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
                    </span>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='project-nombre' className='text-text-muted text-xs font-medium'>
                            Nombre
                        </label>
                        <input
                            id='project-nombre'
                            type='text'
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder='Terminar el informe'
                            className='border-border bg-bg text-text placeholder:text-text-muted rounded-lg border px-3 py-2.5 text-sm'
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='project-deadline' className='text-text-muted text-xs font-medium'>
                            Fecha límite
                        </label>
                        <DatePickerField id='project-deadline' value={deadline} onChange={setDeadline} />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='project-notas' className='text-text-muted text-xs font-medium'>
                            Notas (opcional)
                        </label>
                        <textarea
                            id='project-notas'
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            rows={2}
                            className='border-border bg-bg text-text placeholder:text-text-muted resize-none rounded-lg border px-3 py-2.5 text-sm'
                        />
                    </div>

                    {isEdit && (
                        <button
                            type='button'
                            onClick={handleToggleEstado}
                            disabled={togglingEstado}
                            className='border-border text-text-muted hover:border-text-muted hover:text-text w-fit rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50'
                        >
                            {target.project.estado === 'hecho' ? '↺ Volver a pendiente' : '✓ Marcar como hecho'}
                        </button>
                    )}

                    {error && <span className='text-sm text-red-400'>{error}</span>}
                </div>

                <div className='border-border flex items-center justify-between border-t p-4'>
                    {isEdit ? (
                        <button
                            type='button'
                            onClick={handleDelete}
                            disabled={deleting || saving}
                            className='text-sm font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-50'
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='border-border text-text-muted rounded-lg border px-4 py-2 text-sm font-medium'
                        >
                            Cancelar
                        </button>
                        <button
                            type='button'
                            onClick={handleSave}
                            disabled={saving || deleting}
                            className='bg-accent-2 text-accent-ink rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
