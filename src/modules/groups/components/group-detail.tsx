import { useState } from 'react'

import { useAddGroupMember } from '../hooks/use-add-group-member'
import { useDeleteGroup } from '../hooks/use-delete-group'
import { useGroup } from '../hooks/use-group'
import { useRemoveGroupMember } from '../hooks/use-remove-group-member'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSessionStore } from '@/modules/account/store/session-store'
import { useFriends } from '@/modules/friends/hooks/use-friends'

interface GroupDetailProps {
    groupId: string
    onLeft: () => void
}

export function GroupDetail({ groupId, onLeft }: GroupDetailProps) {
    const { data: group, isLoading } = useGroup(groupId)
    const { data: friends } = useFriends()
    const myUserId = useSessionStore(state => state.session?.userId)
    const addMemberMutation = useAddGroupMember()
    const removeMemberMutation = useRemoveGroupMember()
    const deleteGroupMutation = useDeleteGroup()
    const [confirmingUserId, setConfirmingUserId] = useState<string | null>(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    if (isLoading || !group) return <p className='text-text-muted text-sm'>Cargando...</p>

    const isOwner = group.ownerId === myUserId
    const availableFriends = (friends ?? []).filter(f => !group.members.some(m => m.id === f.id))
    const confirmingMember = group.members.find(m => m.id === confirmingUserId)

    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <span className='text-text text-base font-semibold'>{group.name}</span>
                {isOwner ? (
                    <button
                        type='button'
                        onClick={() => setConfirmingDelete(true)}
                        className='text-text-muted text-xs hover:text-red-400'
                    >
                        Borrar grupo
                    </button>
                ) : (
                    <button
                        type='button'
                        onClick={() =>
                            myUserId &&
                            removeMemberMutation.mutate({ groupId, userId: myUserId }, { onSuccess: onLeft })
                        }
                        className='text-text-muted text-xs hover:text-red-400'
                    >
                        Salir del grupo
                    </button>
                )}
            </div>

            <div className='flex flex-col gap-2'>
                {group.members.map(member => (
                    <div
                        key={member.id}
                        className='border-border bg-surface flex items-center justify-between rounded-xl border px-4 py-3'
                    >
                        <span className='text-text text-[15px] font-medium'>
                            {member.username}
                            {member.id === group.ownerId && <span className='text-text-muted text-xs'> · dueño</span>}
                        </span>

                        <div className='flex items-center gap-4'>
                            {member.profileSnapshot ? (
                                <span className='text-text-muted font-mono text-xs'>
                                    Nivel {member.profileSnapshot.nivel} · {member.profileSnapshot.xpTotal} XP ·{' '}
                                    {member.profileSnapshot.rachaMaxima} sem
                                </span>
                            ) : (
                                <span className='text-text-muted font-mono text-xs'>Sin datos todavía</span>
                            )}

                            {isOwner && member.id !== group.ownerId && (
                                <button
                                    type='button'
                                    onClick={() => setConfirmingUserId(member.id)}
                                    aria-label={`Sacar a ${member.username}`}
                                    className='text-text-muted text-xs hover:text-red-400'
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isOwner && availableFriends.length > 0 && (
                <div className='flex flex-col gap-2'>
                    <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>
                        Agregar al grupo
                    </span>
                    {availableFriends.map(friend => (
                        <div
                            key={friend.id}
                            className='border-border bg-surface flex items-center justify-between rounded-lg border px-3.5 py-2.5'
                        >
                            <span className='text-text text-sm font-medium'>{friend.username}</span>
                            <button
                                type='button'
                                onClick={() => addMemberMutation.mutate({ groupId, memberId: friend.id })}
                                disabled={addMemberMutation.isPending}
                                className='bg-accent text-accent-ink rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                            >
                                Agregar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {confirmingMember && (
                <ConfirmDialog
                    title={`Sacar a "${confirmingMember.username}"`}
                    description='Deja de ver el progreso del grupo.'
                    onConfirm={() => {
                        removeMemberMutation.mutate({ groupId, userId: confirmingMember.id })
                        setConfirmingUserId(null)
                    }}
                    onCancel={() => setConfirmingUserId(null)}
                />
            )}

            {confirmingDelete && (
                <ConfirmDialog
                    title={`Borrar "${group.name}"`}
                    description='Se borra el grupo para todos los miembros.'
                    onConfirm={() => {
                        deleteGroupMutation.mutate(groupId, { onSuccess: onLeft })
                        setConfirmingDelete(false)
                    }}
                    onCancel={() => setConfirmingDelete(false)}
                />
            )}
        </div>
    )
}
