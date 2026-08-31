import { useGroups } from '../hooks/use-groups'

interface GroupListProps {
    onSelect: (groupId: string) => void
    onCreateClick: () => void
}

export function GroupList({ onSelect, onCreateClick }: GroupListProps) {
    const { data: groups, isLoading } = useGroups()

    return (
        <div className='flex flex-col gap-2.5'>
            <div className='flex items-center justify-between'>
                <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>Tus grupos</span>
                <button
                    type='button'
                    onClick={onCreateClick}
                    className='bg-accent text-accent-ink rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase'
                >
                    Crear grupo
                </button>
            </div>

            {isLoading && <p className='text-text-muted text-sm'>Cargando...</p>}
            {!isLoading && groups?.length === 0 && <p className='text-text-muted text-sm'>Todavía no tenés grupos.</p>}

            <div className='flex flex-col gap-2'>
                {groups?.map(group => (
                    <button
                        type='button'
                        key={group.id}
                        onClick={() => onSelect(group.id)}
                        className='border-border bg-surface flex items-center justify-between rounded-xl border px-4 py-3 text-left'
                    >
                        <span className='text-text text-[15px] font-medium'>{group.name}</span>
                        <span className='text-text-muted font-mono text-xs'>{group.memberCount} miembros</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
