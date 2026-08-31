import { useState } from 'react'

import { useCreateGroup } from '../hooks/use-create-group'

import { useFriends } from '@/modules/friends/hooks/use-friends'

interface CreateGroupFormProps {
    onCreated: (groupId: string) => void
    onCancel: () => void
}

export function CreateGroupForm({ onCreated, onCancel }: CreateGroupFormProps) {
    const { data: friends } = useFriends()
    const [name, setName] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const createGroupMutation = useCreateGroup()

    function toggle(id: string) {
        setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
    }

    function submit() {
        if (!name.trim()) return
        createGroupMutation.mutate(
            { name: name.trim(), memberIds: selectedIds },
            { onSuccess: group => onCreated(group.id) }
        )
    }

    return (
        <div className='border-border bg-surface flex flex-col gap-3 rounded-xl border p-4'>
            <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Nuevo grupo</span>
            <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Nombre del grupo'
                className='border-border bg-bg text-text placeholder:text-text-muted rounded-lg border px-3 py-2.5 text-sm'
            />

            {friends && friends.length > 0 ? (
                <div className='flex flex-col gap-1.5'>
                    <span className='text-text-muted text-xs'>Elegí amigos para sumar</span>
                    {friends.map(friend => (
                        <label key={friend.id} className='text-text flex items-center gap-2 text-sm'>
                            <input
                                type='checkbox'
                                checked={selectedIds.includes(friend.id)}
                                onChange={() => toggle(friend.id)}
                            />
                            {friend.username}
                        </label>
                    ))}
                </div>
            ) : (
                <p className='text-text-muted text-xs'>Todavía no tenés amigos para sumar a un grupo.</p>
            )}

            <div className='flex justify-end gap-2'>
                <button
                    type='button'
                    onClick={onCancel}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-xs font-medium'
                >
                    Cancelar
                </button>
                <button
                    type='button'
                    onClick={submit}
                    disabled={!name.trim() || createGroupMutation.isPending}
                    className='bg-accent text-accent-ink rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50'
                >
                    Crear
                </button>
            </div>
        </div>
    )
}
