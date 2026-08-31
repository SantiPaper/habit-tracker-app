import { useSessionStore } from '@/modules/account/store/session-store'
import { ImportanciaColorsSettings } from '@/modules/profile/components/importancia-colors-settings'
import { LevelHero } from '@/modules/profile/components/level-hero'
import { NextMilestonesList } from '@/modules/profile/components/next-milestones-list'

export function ProfilePage() {
    const session = useSessionStore(state => state.session)

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-9 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Perfil</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Perfil</h2>
            </div>

            <div className='border-border bg-surface/50 flex items-center gap-3 rounded-xl border border-dashed px-4 py-3'>
                <div className='bg-surface-2 text-text-muted flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm'>
                    {session ? session.username.charAt(0).toUpperCase() : '?'}
                </div>
                <div className='flex flex-col gap-0.5'>
                    <span className='text-text text-sm font-medium'>{session ? session.username : 'Vos'}</span>
                    <span className='text-text-muted text-xs'>
                        {session
                            ? 'Conectado — tus amigos ven este progreso en la pestaña Amigos'
                            : 'Sin cuenta todavía — iniciá sesión en la pestaña Amigos para que tu progreso lo vean otros'}
                    </span>
                </div>
            </div>

            <LevelHero />

            <ImportanciaColorsSettings />

            <div className='flex flex-col gap-3'>
                <div className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Próximos logros</div>
                <NextMilestonesList />
            </div>
        </div>
    )
}
