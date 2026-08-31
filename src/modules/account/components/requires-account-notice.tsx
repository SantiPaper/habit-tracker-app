import { useNavigationStore } from '@/core/stores/navigation-store'

interface RequiresAccountNoticeProps {
    message: string
}

/** Aviso compartido para secciones que dependen de tener cuenta (XP/ligas/amigos) — lleva directo a Perfil, donde vive el login/registro. */
export function RequiresAccountNotice({ message }: RequiresAccountNoticeProps) {
    return (
        <div className='border-border bg-surface/50 flex flex-col items-start gap-3 rounded-xl border border-dashed px-4 py-5'>
            <span className='text-text-muted text-sm'>{message}</span>
            <button
                type='button'
                onClick={() => useNavigationStore.getState().setTab('profile')}
                className='bg-accent text-accent-ink rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-opacity hover:opacity-90 active:opacity-80'
            >
                Ir a Perfil
            </button>
        </div>
    )
}
