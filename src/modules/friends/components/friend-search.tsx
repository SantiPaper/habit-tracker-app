import { useState } from 'react'

import { useSearchUsers } from '../hooks/use-search-users'
import { useSendFriendRequest } from '../hooks/use-send-friend-request'

export function FriendSearch() {
    const [query, setQuery] = useState('')
    const { data: results, isFetching } = useSearchUsers(query)
    const sendRequestMutation = useSendFriendRequest()

    return (
        <div className='flex flex-col gap-2.5'>
            <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Buscar amigos</span>
            <input
                type='text'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Nombre de usuario'
                className='border-border bg-bg text-text placeholder:text-text-muted rounded-lg border px-3 py-2.5 text-sm'
            />

            {isFetching && <p className='text-text-muted text-xs'>Buscando...</p>}

            {results && results.length > 0 && (
                <div className='flex flex-col gap-2'>
                    {results.map(user => (
                        <div
                            key={user.id}
                            className='border-border bg-surface flex items-center justify-between rounded-lg border px-3.5 py-2.5'
                        >
                            <span className='text-text text-sm font-medium'>{user.username}</span>
                            <button
                                type='button'
                                onClick={() => sendRequestMutation.mutate(user.id)}
                                disabled={sendRequestMutation.isPending}
                                className='bg-accent text-accent-ink rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase disabled:opacity-50'
                            >
                                Agregar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {results && results.length === 0 && query.trim().length > 0 && !isFetching && (
                <p className='text-text-muted text-xs'>Nadie con ese nombre.</p>
            )}
        </div>
    )
}
