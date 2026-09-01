import { create } from 'zustand'

import type { Project } from '../types/project.types'

type ProjectDialogTarget = { mode: 'create'; defaultDeadline: string } | { mode: 'edit'; project: Project }

interface ProjectDialogState {
    target: ProjectDialogTarget | null
    openCreate: (defaultDeadline: string) => void
    openEdit: (project: Project) => void
    close: () => void
}

/** Mismo patrón que `event-dialog-store.ts` — evita prop-drilling del "abrir para editar" por las 4 sub-vistas de Agenda. */
export const useProjectDialogStore = create<ProjectDialogState>(set => ({
    target: null,
    openCreate: defaultDeadline => set({ target: { mode: 'create', defaultDeadline } }),
    openEdit: project => set({ target: { mode: 'edit', project } }),
    close: () => set({ target: null })
}))
