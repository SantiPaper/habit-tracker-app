import type { CSSProperties, ReactNode } from 'react'

import { useHabitFreezes } from '@/modules/achievements/hooks/use-habit-freezes'
import { useHabitStreak } from '@/modules/achievements/hooks/use-habit-streak'
import { useLeagueUpFlourish } from '@/modules/achievements/hooks/use-league-up-flourish'
import { STREAK_TIERS, achievedTier } from '@/modules/achievements/lib/tiers'
import type { Habit } from '@/modules/habits/types/habit.types'

function TrophyIcon({ color }: { color: string }) {
    return (
        <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M8 21h8M12 17v4' />
            <path d='M7 4h10v5a5 5 0 0 1-10 0V4Z' />
            <path d='M17 5h2a2 2 0 0 1 2 2 4 4 0 0 1-4 4M7 5H5a2 2 0 0 0-2 2 4 4 0 0 0 4 4' />
        </svg>
    )
}

/**
 * Fila "Rank Badge": insignia circular con el color de la liga alcanzada + overview de 6 puntos
 * (uno por liga) + racha máxima. Dirección elegida por el usuario tras explorar 3 alternativas
 * en un canvas de diseño — reemplaza la barra plana de 18 segmentos que no convenció.
 *
 * `children`, si se pasa, se agrega debajo con un separador — así el resto de "Resumen" (progreso
 * semana/mes, marcar el período, reclamos de XP) se combina en la misma tarjeta que el rango, en
 * vez de vivir en dos pantallas separadas.
 */
export function RankBadgeRow({ habit, children }: { habit: Habit; children?: ReactNode }) {
    const { data: streak, isLoading } = useHabitStreak(habit)
    const { data: freezes } = useHabitFreezes(habit.id)
    const tier = streak ? achievedTier(streak.maxima) : null
    const flourishing = useLeagueUpFlourish(habit.id, habit.nombre, tier)

    if (isLoading || !streak) return null

    let subtitle: string
    if (tier?.open) {
        // Liga sin techo: en vez de "faltan N para subir de liga" es un contador de semanas ahí.
        const semanasEnLiga = streak.maxima - tier.milestones[0] + 1
        subtitle = `${semanasEnLiga}ª semana seguida ahí`
    } else {
        // Siempre en términos de "subir de liga", no de hitos internos — los 3 hitos de cada liga
        // (bronce, plata, ...) son un detalle interno que ya se ve en los puntitos de al lado; acá
        // lo que importa es cuánto falta para el próximo salto de liga real.
        const nextTier = STREAK_TIERS[tier ? STREAK_TIERS.indexOf(tier) + 1 : 0]
        const faltan = nextTier.milestones[0] - streak.maxima
        subtitle = `Faltan ${faltan} ${faltan === 1 ? 'semana' : 'semanas'} para subir a ${nextTier.nombre}`
    }

    return (
        <div className='border-border bg-surface flex flex-col gap-3 rounded-2xl border px-4.5 py-3.5'>
            <div className='flex items-center gap-4'>
                <div
                    className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 ${flourishing ? 'league-up-flourish' : ''}`}
                    style={
                        {
                            background: tier ? tier.bg : 'var(--color-surface-2)',
                            borderColor: tier ? tier.accent : 'var(--color-border)',
                            ...(flourishing && tier ? { '--flourish-color': tier.accent } : undefined)
                        } as CSSProperties
                    }
                >
                    <TrophyIcon color={tier ? tier.accent : 'var(--color-text-muted)'} />
                </div>

                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <span className='text-text truncate text-[15px] font-medium'>{habit.nombre}</span>
                    <span className='text-text-muted font-mono text-[11px] tracking-wide uppercase'>
                        {tier ? tier.nombre : 'Sin liga'} · {subtitle}
                    </span>
                </div>

                <div className='flex shrink-0 gap-1.5'>
                    {STREAK_TIERS.map(t => {
                        const started = streak.maxima >= t.milestones[0]
                        const cleared = t.open ? started : streak.maxima >= t.milestones[2]
                        return (
                            <div
                                key={t.id}
                                title={`${t.nombre} — ${cleared ? (t.open ? 'alcanzada' : 'liga completa') : started ? 'en progreso' : 'bloqueada'}`}
                                className='h-[7px] w-[7px] rounded-full'
                                style={{
                                    background: started ? t.accent : 'var(--color-border)',
                                    opacity: cleared ? 1 : started ? 0.5 : 0.35
                                }}
                            />
                        )
                    })}
                </div>

                <div className='flex shrink-0 items-center gap-2'>
                    {!!freezes && freezes > 0 && (
                        <span
                            title={`${freezes} ${freezes === 1 ? 'freeze disponible' : 'freezes disponibles'} — cubren un día salteado sin cortar la racha`}
                            className='border-accent-2 text-accent-2 rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-bold'
                        >
                            🧊 x{freezes}
                        </span>
                    )}
                    <span className='text-text font-mono text-lg font-bold'>
                        {streak.maxima}
                        <span className='text-text-muted text-[11px] font-normal'> sem</span>
                    </span>
                </div>
            </div>

            {children && <div className='border-border border-t pt-3'>{children}</div>}
        </div>
    )
}
