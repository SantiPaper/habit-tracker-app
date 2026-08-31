import { usePendingRequests } from '../hooks/use-pending-requests'
import { useRespondToRequest } from '../hooks/use-respond-to-request'

export function PendingRequestsList() {
    const { data: requests } = usePendingRequests()
    const respondMutation = useRespondToRequest()

    if (!requests || requests.length === 0) return null

    return (
        <div className='flex flex-col gap-2.5'>
            <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Pedidos pendientes</span>
            <div className='flex flex-col gap-2'>
                {requests.map(request => (
                    <div
                        key={request.friendshipId}
                        className='border-border bg-surface flex items-center justify-between rounded-lg border px-3.5 py-2.5'
                    >
                        <span className='text-text text-sm font-medium'>{request.from.username}</span>
                        <div className='flex gap-2'>
                            <button
                                type='button'
                                onClick={() =>
                                    respondMutation.mutate({ friendshipId: request.friendshipId, accept: true })
                                }
                                disabled={respondMutation.isPending}
                                className='bg-accent text-accent-ink rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
                            >
                                Aceptar
                            </button>
                            <button
                                type='button'
                                onClick={() =>
                                    respondMutation.mutate({ friendshipId: request.friendshipId, accept: false })
                                }
                                disabled={respondMutation.isPending}
                                className='border-border text-text-muted rounded-full border px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase disabled:opacity-50'
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
