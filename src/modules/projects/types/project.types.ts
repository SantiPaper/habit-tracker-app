export type ProjectEstado = 'pendiente' | 'hecho'

export interface Project {
    id: string
    nombre: string
    /** Fecha límite, `YYYY-MM-DD`. Aparece una sola vez en la Agenda, ese día — no todos los días
     * entre hoy y el deadline. */
    deadline: string
    notas: string | null
    estado: ProjectEstado
    createdAt: string
    updatedAt: string
}
