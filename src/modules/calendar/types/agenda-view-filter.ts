export type AgendaViewFilter = 'todos' | 'habitos' | 'proyectos' | 'eventos'

export const AGENDA_VIEW_FILTERS: { id: AgendaViewFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'habitos', label: 'Hábitos' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'eventos', label: 'Eventos' }
]

export function showHabits(filter: AgendaViewFilter): boolean {
    return filter === 'todos' || filter === 'habitos'
}

export function showProjects(filter: AgendaViewFilter): boolean {
    return filter === 'todos' || filter === 'proyectos'
}

export function showEvents(filter: AgendaViewFilter): boolean {
    return filter === 'todos' || filter === 'eventos'
}
