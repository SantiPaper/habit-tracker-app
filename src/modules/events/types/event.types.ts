export interface Event {
    id: string
    nombre: string
    /** Fecha puntual del evento, `YYYY-MM-DD`. Sin recurrencia — un cumpleaños que se repite cada
     * año se vuelve a cargar a mano el año que viene, a propósito (decisión del usuario). */
    fecha: string
    notas: string | null
    createdAt: string
    updatedAt: string
}
