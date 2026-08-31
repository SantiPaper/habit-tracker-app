import { LoginRegisterForm } from '@/modules/account/components/login-register-form'
import { useLogout } from '@/modules/account/hooks/use-logout'
import { useSessionStore } from '@/modules/account/store/session-store'
import { FriendSearch } from '@/modules/friends/components/friend-search'
import { FriendsList } from '@/modules/friends/components/friends-list'
import { PendingRequestsList } from '@/modules/friends/components/pending-requests-list'

export function FriendsPage() {
    const session = useSessionStore(state => state.session)
    const hydrated = useSessionStore(state => state.hydrated)
    const logoutMutation = useLogout()

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-9 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Amigos</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Amigos</h2>
            </div>

            {!hydrated && <p className='text-text-muted'>Cargando...</p>}

            {hydrated && !session && <LoginRegisterForm />}

            {hydrated && session && (
                <div className='flex flex-col gap-8'>
                    <div className='flex items-center justify-between'>
                        <span className='text-text-muted text-sm'>
                            Conectado como <span className='text-text font-medium'>{session.username}</span>
                        </span>
                        <button
                            type='button'
                            onClick={() => logoutMutation.mutate()}
                            disabled={logoutMutation.isPending}
                            className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50'
                        >
                            Cerrar sesión
                        </button>
                    </div>

                    <FriendSearch />
                    <PendingRequestsList />
                    <FriendsList />
                </div>
            )}
        </div>
    )
}
