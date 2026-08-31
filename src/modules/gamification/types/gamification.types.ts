export type PeriodoTipo = 'semanal' | 'mensual'

export interface PeriodClaim {
    id: string
    habitId: string
    tipo: PeriodoTipo
    periodo: string
    xpOtorgado: number
}

export interface XpSummary {
    xpTotal: number
    nivel: number
    xpEnNivel: number
    xpParaProximoNivel: number
}
