export interface StreakTier {
    id: string
    nombre: string
    /**
     * Hitos de la liga, en semanas perfectas consecutivas. Para una liga cerrada son sus 3
     * checkpoints reales; para una liga `open` (hoy solo Hábito Atómico) solo `milestones[0]`
     * importa — es el umbral de entrada, no hay techo.
     */
    milestones: readonly [number, number, number]
    /**
     * Liga sin techo: no tiene 3 hitos fijos para desbloquear, sino un contador de semanas que
     * sigue subiendo mientras la racha no se corte. Solo la última liga es así — llegar ahí ya es
     * la cima, no tiene sentido ponerle un límite arbitrario.
     */
    open?: boolean
    /** Fondo del panel — tenue, siempre visible aunque no se haya desbloqueado nada todavía. */
    bg: string
    /** Borde del panel. */
    border: string
    /** Color de acento cuando se desbloquea un logro de esta liga (nombre de la liga + insignias). */
    accent: string
}

/**
 * Ligas de logros de racha: 5 niveles cerrados de a 3 hitos, subiendo de a 1 semana dentro de
 * cada liga y de a 3 entre ligas, más la cima abierta "Hábito Atómico" — guiño al libro que
 * inspiró la idea de trackear hábitos chicos y consistentes. Cada liga tiene su propio color, a
 * pedido explícito del usuario (única excepción a la paleta casi monocromo del resto de la app).
 */
export const STREAK_TIERS: StreakTier[] = [
    {
        id: 'bronce',
        nombre: 'Bronce',
        milestones: [1, 2, 3],
        bg: 'oklch(0.24 0.03 50)',
        border: 'oklch(0.4 0.05 50)',
        accent: 'oklch(0.72 0.1 55)'
    },
    {
        id: 'plata',
        nombre: 'Plata',
        milestones: [4, 5, 6],
        bg: 'oklch(0.26 0.006 250)',
        border: 'oklch(0.42 0.01 250)',
        accent: 'oklch(0.85 0.01 250)'
    },
    {
        id: 'oro',
        nombre: 'Oro',
        milestones: [7, 8, 9],
        bg: 'oklch(0.24 0.04 85)',
        border: 'oklch(0.42 0.08 85)',
        accent: 'oklch(0.82 0.15 88)'
    },
    {
        id: 'platino',
        nombre: 'Platino',
        milestones: [10, 11, 12],
        bg: 'oklch(0.25 0.015 210)',
        border: 'oklch(0.42 0.03 210)',
        accent: 'oklch(0.88 0.04 210)'
    },
    {
        id: 'diamante',
        nombre: 'Diamante',
        milestones: [13, 14, 15],
        bg: 'oklch(0.24 0.04 235)',
        border: 'oklch(0.42 0.09 235)',
        accent: 'oklch(0.82 0.14 235)'
    },
    {
        id: 'atomico',
        nombre: 'Hábito Atómico',
        milestones: [16, 17, 18],
        open: true,
        bg: 'oklch(0.24 0.06 320)',
        border: 'oklch(0.5 0.15 320)',
        accent: 'oklch(0.82 0.19 330)'
    }
]

/**
 * Todos los hitos "reclamables" como próximo objetivo, aplanados y en orden. Una liga cerrada
 * aporta sus 3 hitos; una liga abierta solo aporta su umbral de entrada (no tiene más hitos
 * después de eso, entrar ya es la cima).
 */
export const ALL_STREAK_MILESTONES = STREAK_TIERS.flatMap(tier =>
    (tier.open ? [tier.milestones[0]] : tier.milestones).map(milestone => ({ milestone, tier }))
)

/** La liga más alta ya alcanzada (con al menos 1 hito desbloqueado), o `null` si `maxima` es 0. */
export function achievedTier(maxima: number): StreakTier | null {
    if (maxima <= 0) return null
    for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
        if (maxima >= STREAK_TIERS[i].milestones[0]) return STREAK_TIERS[i]
    }
    return null
}

/** El próximo hito a desbloquear para una racha `maxima`, o `null` si ya está en la liga sin techo. */
export function nextMilestoneFor(maxima: number): { milestone: number; tier: StreakTier } | null {
    return ALL_STREAK_MILESTONES.find(x => x.milestone > maxima) ?? null
}
