const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

interface RescheduleConfirmDialogProps {
    habitNombre: string
    dayOfWeek: number
    newHora: string
    onOnlyToday: () => void
    onForever: () => void
    onCancel: () => void
    pending: boolean
}

/** Diálogo chico al soltar un hábito recurrente arrastrado — mismo look de modal que EventDialog/ProjectDialog. */
export function RescheduleConfirmDialog({
    habitNombre,
    dayOfWeek,
    newHora,
    onOnlyToday,
    onForever,
    onCancel,
    pending
}: RescheduleConfirmDialogProps) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onCancel}>
            <div
                className='border-border bg-surface flex w-96 flex-col gap-4 rounded-2xl border p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-1.5'>
                    <span className='text-accent font-mono text-xs font-bold tracking-widest uppercase'>
                        Cambiar horario
                    </span>
                    <span className='text-text text-base font-semibold'>{habitNombre}</span>
                    <span className='text-text-muted text-sm'>
                        Nuevo horario: <span className='text-text font-mono'>{newHora}</span>
                    </span>
                </div>

                <p className='text-text-muted text-sm'>
                    ¿Cambiar solo hoy, o el horario de los {DIAS_LARGOS[dayOfWeek]} para siempre?
                </p>

                <div className='flex flex-col gap-2'>
                    <button
                        type='button'
                        onClick={onOnlyToday}
                        disabled={pending}
                        className='bg-accent text-accent-ink rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                    >
                        Solo hoy
                    </button>
                    <button
                        type='button'
                        onClick={onForever}
                        disabled={pending}
                        className='border-accent-2 text-accent-2 hover:bg-accent-2/10 rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50'
                    >
                        Para siempre
                    </button>
                    <button
                        type='button'
                        onClick={onCancel}
                        disabled={pending}
                        className='text-text-muted hover:text-text px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-50'
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
