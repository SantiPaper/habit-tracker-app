import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { useFriendActivity } from '../hooks/use-friend-activity'
import { formatActivityMessage } from '../lib/friend-activity'

export function ActivityFeedList() {
    const { data: activity, isLoading } = useFriendActivity()

    return (
        <div className='flex flex-col gap-2.5'>
            <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Logros de tus amigos</span>

            {isLoading && <p className='text-text-muted text-sm'>Cargando...</p>}
            {!isLoading && activity?.length === 0 && (
                <p className='text-text-muted text-sm'>
                    Todavía no hay nada por acá — cuando un amigo suba de nivel o supere su racha, va a aparecer.
                </p>
            )}

            <div className='flex flex-col gap-2'>
                {activity?.map(event => (
                    <div
                        key={event.id}
                        className='border-border bg-surface flex items-center justify-between rounded-xl border px-4 py-3'
                    >
                        <span className='text-text text-[15px] font-medium'>{formatActivityMessage(event)}</span>
                        <span className='text-text-muted font-mono text-xs whitespace-nowrap'>
                            {formatDistanceToNow(parseISO(event.createdAt), { addSuffix: true, locale: es })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
