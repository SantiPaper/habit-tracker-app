import { STREAK_TIERS } from '@/modules/achievements/lib/tiers'

interface AchievementsInfoDialogProps {
    onClose: () => void
}

/** Explica el sistema de logros: qué es una "semana perfecta" y cómo suben las ligas. */
export function AchievementsInfoDialog({ onClose }: AchievementsInfoDialogProps) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
            <div
                className='border-border bg-surface flex w-[420px] flex-col gap-4 rounded-2xl border p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-1.5'>
                    <span className='text-text text-base font-semibold'>Cómo funcionan los logros</span>
                    <p className='text-text-muted text-sm leading-relaxed'>
                        Cada semana que cumplís el 100% de lo programado de un hábito cuenta como{' '}
                        <span className='text-text font-medium'>semana perfecta</span>. Encadenar semanas perfectas
                        seguidas te sube de liga — vale lo mismo si el hábito es 1 vez por semana o 6, lo que importa es
                        cumplir lo que te propusiste esa semana.
                    </p>
                </div>

                <div className='flex flex-col gap-1.5'>
                    {STREAK_TIERS.map(tier => (
                        <div
                            key={tier.id}
                            className='flex items-center justify-between gap-3 rounded-lg px-3 py-2'
                            style={{ background: tier.bg }}
                        >
                            <span
                                className='font-mono text-[11px] font-bold tracking-wide uppercase'
                                style={{ color: tier.accent }}
                            >
                                {tier.nombre}
                            </span>
                            <span className='text-text-muted font-mono text-[11px]'>
                                {tier.open
                                    ? `${tier.milestones[0]}+ semanas seguidas`
                                    : `${tier.milestones[0]}–${tier.milestones[2]} semanas seguidas`}
                            </span>
                        </div>
                    ))}
                </div>

                <p className='text-text-muted text-[13px] leading-relaxed'>
                    Al llegar a Hábito Atómico ya no hay más hitos fijos — el contador sigue subiendo semana a semana
                    mientras no cortes la racha, sin techo.
                </p>

                <p className='text-text-muted text-[13px] leading-relaxed'>
                    Si pausás un hábito un día, esa fecha no cuenta a favor ni en contra. Y un logro desbloqueado no se
                    pierde, aunque la racha se corte después.
                </p>

                <button
                    type='button'
                    onClick={onClose}
                    className='border-border text-text self-end rounded-lg border px-4 py-2 text-sm font-medium'
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}
