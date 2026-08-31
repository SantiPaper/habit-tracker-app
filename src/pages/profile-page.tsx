import { LoginRegisterForm } from '@/modules/account/components/login-register-form'
import { useLogout } from '@/modules/account/hooks/use-logout'
import { useSessionStore } from '@/modules/account/store/session-store'
import { ImportanciaColorsSettings } from '@/modules/profile/components/importancia-colors-settings'
import { LevelHero } from '@/modules/profile/components/level-hero'
import { NextMilestonesList } from '@/modules/profile/components/next-milestones-list'

export function ProfilePage() {
    const session = useSessionStore(state => state.session)
    const hydrated = useSessionStore(state => state.hydrated)
    const logoutMutation = useLogout()

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-9 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Perfil</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Perfil</h2>
            </div>

            {!hydrated && <p className='text-text-muted'>Cargando...</p>}

            {hydrated && !session && <LoginRegisterForm />}

            {hydrated && session && (
                <div className='border-border bg-surface/50 flex items-center gap-3 rounded-xl border border-dashed px-4 py-3'>
                    <div className='bg-surface-2 text-text-muted flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm'>
                        {session.username.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-1 flex-col gap-0.5'>
                        <span className='text-text text-sm font-medium'>{session.username}</span>
                        <span className='text-text-muted text-xs'>
                            Conectado — tus amigos ven este progreso en la pestaña Amigos
                        </span>
                    </div>
                    <button
                        type='button'
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className='border-border text-text-muted hover:border-text-muted hover:text-text rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50'
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}

            {hydrated && session && (
                <>
                    <LevelHero />

                    <div className='flex flex-col gap-3'>
                        <div className='text-text-muted text-xs font-semibold tracking-wider uppercase'>
                            Próximos logros
                        </div>
                        <NextMilestonesList />
                    </div>
                </>
            )}

            <ImportanciaColorsSettings />
        </div>
    )
}
