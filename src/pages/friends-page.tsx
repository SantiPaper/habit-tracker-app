import { useState } from 'react'

import { RequiresAccountNotice } from '@/modules/account/components/requires-account-notice'
import { useSessionStore } from '@/modules/account/store/session-store'
import { ActivityFeedList } from '@/modules/friends/components/activity-feed-list'
import { FriendSearch } from '@/modules/friends/components/friend-search'
import { FriendsList } from '@/modules/friends/components/friends-list'
import { PendingRequestsList } from '@/modules/friends/components/pending-requests-list'
import { useFriends } from '@/modules/friends/hooks/use-friends'
import { CreateGroupForm } from '@/modules/groups/components/create-group-form'
import { GroupDetail } from '@/modules/groups/components/group-detail'
import { GroupList } from '@/modules/groups/components/group-list'
import { useGroup } from '@/modules/groups/hooks/use-group'
import { useGroups } from '@/modules/groups/hooks/use-groups'
import { LeaderboardList } from '@/modules/leaderboard/components/leaderboard-list'

type View = 'amigos' | 'grupos' | 'ranking' | 'actividad'

const VIEWS: { id: View; label: string }[] = [
    { id: 'amigos', label: 'Amigos' },
    { id: 'grupos', label: 'Grupos' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'actividad', label: 'Actividad' }
]

export function FriendsPage() {
    const session = useSessionStore(state => state.session)
    const hydrated = useSessionStore(state => state.hydrated)

    const [view, setView] = useState<View>('amigos')
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [creatingGroup, setCreatingGroup] = useState(false)
    const [rankingSource, setRankingSource] = useState<'friends' | string>('friends')

    const { data: friends } = useFriends()
    const { data: groups } = useGroups()
    const { data: rankingGroup } = useGroup(rankingSource === 'friends' ? null : rankingSource)

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-9 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Amigos</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Amigos</h2>
            </div>

            {!hydrated && <p className='text-text-muted'>Cargando...</p>}

            {hydrated && !session && (
                <RequiresAccountNotice message='Iniciá sesión desde tu Perfil para agregar amigos, armar grupos y ver el ranking.' />
            )}

            {hydrated && session && (
                <div className='flex flex-col gap-8'>
                    <div className='border-border flex gap-1 border-b'>
                        {VIEWS.map(v => (
                            <button
                                key={v.id}
                                type='button'
                                onClick={() => setView(v.id)}
                                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                                    view === v.id
                                        ? 'border-accent text-text border-b-2'
                                        : 'text-text-muted hover:text-text border-b-2 border-transparent'
                                }`}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>

                    {view === 'amigos' && (
                        <>
                            <FriendSearch />
                            <PendingRequestsList />
                            <FriendsList />
                        </>
                    )}

                    {view === 'grupos' &&
                        (selectedGroupId ? (
                            <div className='flex flex-col gap-3'>
                                <button
                                    type='button'
                                    onClick={() => setSelectedGroupId(null)}
                                    className='text-text-muted hover:text-text w-fit text-xs transition-colors'
                                >
                                    ← Volver a grupos
                                </button>
                                <GroupDetail groupId={selectedGroupId} onLeft={() => setSelectedGroupId(null)} />
                            </div>
                        ) : creatingGroup ? (
                            <CreateGroupForm
                                onCreated={groupId => {
                                    setCreatingGroup(false)
                                    setSelectedGroupId(groupId)
                                }}
                                onCancel={() => setCreatingGroup(false)}
                            />
                        ) : (
                            <GroupList onSelect={setSelectedGroupId} onCreateClick={() => setCreatingGroup(true)} />
                        ))}

                    {view === 'ranking' && (
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-wrap gap-1.5'>
                                <button
                                    type='button'
                                    onClick={() => setRankingSource('friends')}
                                    className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors ${
                                        rankingSource === 'friends'
                                            ? 'bg-accent text-accent-ink'
                                            : 'border-border text-text-muted hover:text-text border'
                                    }`}
                                >
                                    Amigos
                                </button>
                                {groups?.map(g => (
                                    <button
                                        key={g.id}
                                        type='button'
                                        onClick={() => setRankingSource(g.id)}
                                        className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors ${
                                            rankingSource === g.id
                                                ? 'bg-accent text-accent-ink'
                                                : 'border-border text-text-muted hover:text-text border'
                                        }`}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>

                            <LeaderboardList
                                members={rankingSource === 'friends' ? (friends ?? []) : (rankingGroup?.members ?? [])}
                                title={rankingSource === 'friends' ? 'Amigos' : rankingGroup?.name}
                            />
                        </div>
                    )}

                    {view === 'actividad' && <ActivityFeedList />}
                </div>
            )}
        </div>
    )
}
