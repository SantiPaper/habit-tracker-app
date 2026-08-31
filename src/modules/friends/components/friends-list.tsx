import { useState } from 'react'

import { useFriends } from '../hooks/use-friends'
import { useRemoveFriend } from '../hooks/use-remove-friend'

import { ConfirmDialog } from '@/components/confirm-dialog'

export function FriendsList() {
    const { data: friends, isLoading } = useFriends()
    const removeFriendMutation = useRemoveFriend()
    const [confirmingId, setConfirmingId] = useState<string | null>(null)

    const confirming = friends?.find(f => f.friendshipId === confirmingId)

    return (
        <div className='flex flex-col gap-2.5'>
            <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Tus amigos</span>

            {isLoading && <p className='text-text-muted text-sm'>Cargando...</p>}
            {!isLoading && friends?.length === 0 && (
                <p className='text-text-muted text-sm'>Todavía no tenés amigos agregados.</p>
            )}

            <div className='flex flex-col gap-2'>
                {friends?.map(friend => (
                    <div
                        key={friend.friendshipId}
                        className='border-border bg-surface flex items-center justify-between rounded-xl border px-4 py-3'
                    >
                        <span className='text-text text-[15px] font-medium'>{friend.username}</span>

                        <div className='flex items-center gap-4'>
                            {friend.profileSnapshot ? (
                                <span className='text-text-muted font-mono text-xs'>
                                    Nivel {friend.profileSnapshot.nivel} · {friend.profileSnapshot.xpTotal} XP ·{' '}
                                    {friend.profileSnapshot.rachaMaxima} sem
                                </span>
                            ) : (
                                <span className='text-text-muted font-mono text-xs'>Sin datos todavía</span>
                            )}

                            <button
                                type='button'
                                onClick={() => setConfirmingId(friend.friendshipId)}
                                aria-label={`Eliminar a ${friend.username}`}
                                className='text-text-muted text-xs hover:text-red-400'
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {confirming && (
                <ConfirmDialog
                    title={`Eliminar a "${confirming.username}"`}
                    description='Dejan de ser amigos — ya no van a verse el progreso mutuamente.'
                    onConfirm={() => {
                        removeFriendMutation.mutate(confirming.friendshipId)
                        setConfirmingId(null)
                    }}
                    onCancel={() => setConfirmingId(null)}
                />
            )}
        </div>
    )
}
