import { z } from 'zod'

export const settingsSchema = z.object({
    xpPorCumplido: z.number().int().min(0).default(10),
    xpSemanaPerfecta: z.number().int().min(0).default(50),
    xpMesPerfecta: z.number().int().min(0).default(200),
    xpPorMesRacha: z.number().int().min(0).default(30),
    nivelDivisor: z.number().int().min(1).default(50)
})

export type Settings = z.infer<typeof settingsSchema>
export type SettingKey = keyof Settings

export const SETTING_LABELS: Record<SettingKey, string> = {
    xpPorCumplido: 'XP por hábito cumplido',
    xpSemanaPerfecta: 'XP bonus por semana perfecta',
    xpMesPerfecta: 'XP bonus por mes perfecta',
    xpPorMesRacha: 'XP por mes de racha (hábitos mensuales)',
    nivelDivisor: 'Divisor de la curva de nivel'
}

export const SETTING_DESCRIPTIONS: Record<SettingKey, string> = {
    xpPorCumplido: 'Se suma automáticamente cada vez que marcás un hábito como cumplido.',
    xpSemanaPerfecta: 'Bonus que podés reclamar cuando un hábito recurrente tiene la semana perfecta.',
    xpMesPerfecta: 'Bonus que podés reclamar cuando un hábito recurrente tiene el mes perfecto.',
    xpPorMesRacha:
        'Bonus escalado que podés reclamar por un hábito mensual: se multiplica por la racha de meses seguidos cumplidos (mes 1 = este valor, mes 2 seguido = el doble, etc.).',
    nivelDivisor: 'Más alto = subís de nivel más lento. Nivel = raíz(XP total / divisor).'
}
