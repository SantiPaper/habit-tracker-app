import { useXpSummary } from '@/modules/gamification/hooks/use-xp-summary'

/** Versión grande del nivel/XP que ya se ve chico en el HUD de la barra de pestañas. */
export function LevelHero() {
    const { data: xp } = useXpSummary()

    if (!xp) return null

    const percent = xp.xpParaProximoNivel > 0 ? Math.round((xp.xpEnNivel / xp.xpParaProximoNivel) * 100) : 0
    const faltante = Math.max(0, xp.xpParaProximoNivel - xp.xpEnNivel)

    return (
        <div className='border-border bg-surface flex flex-col items-center gap-4 rounded-2xl border px-8 py-10 text-center'>
            <div className='bg-accent text-accent-ink flex h-20 w-20 items-center justify-center rounded-full font-mono text-2xl font-bold'>
                {xp.nivel}
            </div>
            <div className='flex flex-col gap-1'>
                <span className='text-text-muted font-mono text-xs font-bold tracking-widest uppercase'>Nivel</span>
                <span className='text-text-muted font-mono text-sm'>{xp.xpTotal} XP totales</span>
            </div>
            <div className='flex w-full max-w-xs flex-col gap-1.5'>
                <div className='bg-surface-2 h-2 overflow-hidden rounded-full'>
                    <div className='bg-accent h-full rounded-full' style={{ width: `${percent}%` }} />
                </div>
                <span className='text-text-muted font-mono text-[11px]'>
                    {faltante} XP para el nivel {xp.nivel + 1}
                </span>
            </div>
        </div>
    )
}
