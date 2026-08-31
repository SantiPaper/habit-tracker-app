import { useNextMilestones } from '../hooks/use-next-milestones'

/** Los hitos de racha más cercanos a desbloquear entre todos los hábitos — un adelanto de "qué viene". */
export function NextMilestonesList() {
    const { data: items, isLoading } = useNextMilestones()

    if (isLoading) return <p className='text-text-muted'>Cargando...</p>
    if (items && items.length === 0) {
        return <p className='text-text-muted'>Todavía no hay hábitos recurrentes en carrera hacia un logro.</p>
    }

    return (
        <div className='flex flex-col gap-2'>
            {items?.map(item => (
                <div
                    key={item.habitId}
                    className='border-border bg-surface flex items-center gap-3 rounded-xl border px-4 py-3'
                >
                    <div className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ background: item.tierAccent }} />

                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                        <span className='text-text truncate text-sm font-medium'>{item.habitNombre}</span>
                        <span className='text-text-muted font-mono text-[11px] tracking-wide uppercase'>
                            {item.milestone} semanas — liga {item.tierNombre}
                        </span>
                    </div>

                    <span className='text-text shrink-0 font-mono text-xs font-bold'>
                        {item.semanasFaltantes === 1 ? 'Falta 1 semana' : `Faltan ${item.semanasFaltantes} semanas`}
                    </span>
                </div>
            ))}
        </div>
    )
}
