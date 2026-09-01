import { create } from 'zustand'

import type { Event } from '../types/event.types'

type EventDialogTarget = { mode: 'create'; defaultDate: string } | { mode: 'edit'; event: Event }

interface EventDialogState {
    target: EventDialogTarget | null
    openCreate: (defaultDate: string) => void
    openEdit: (event: Event) => void
    close: () => void
}

/**
 * Estado del diálogo de crear/editar Evento, vive en un store aparte (no en `agenda-page.tsx`)
 * a propósito: las 4 sub-vistas de Agenda (Lista/Día/Semana/Mes) están hoy desacopladas entre sí,
 * cada una con su propio estado — pasar un callback de "abrir para editar" por props a las 4
 * significaría tocar la firma de todas. Cualquier `EventChip`, en cualquier vista, puede abrir el
 * diálogo llamando directo a este store, igual que `useNavigationStore`/`useToastStore`.
 */
export const useEventDialogStore = create<EventDialogState>(set => ({
    target: null,
    openCreate: defaultDate => set({ target: { mode: 'create', defaultDate } }),
    openEdit: event => set({ target: { mode: 'edit', event } }),
    close: () => set({ target: null })
}))
