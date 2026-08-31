import { useState } from 'react'

import { useSelfLeaderboardEntry } from '../hooks/use-self-leaderboard-entry'
import { rankMembers } from '../lib/rank-members'
import type { LeaderboardEntry, LeaderboardMetric } from '../types/leaderboard.types'

import type { FriendProfileSnapshot } from '@/modules/friends/types/friends.types'

interface LeaderboardListProps {
    members: { id: string; username: string; profileSnapshot: FriendProfileSnapshot | null }[]
    title?: string
}

const METRICS: { id: LeaderboardMetric; label: string }[] = [
    { id: 'nivel', label: 'Nivel' },
    { id: 'xpTotal', label: 'XP' },
    { id: 'rachaMaxima', label: 'Racha' }
]

/** Ranking reusable — alimentado por amigos (`useFriends`) o por miembros de un grupo (`useGroup`), mismo shape en los dos casos. */
export function LeaderboardList({ members, title }: LeaderboardListProps) {
    const [metric, setMetric] = useState<LeaderboardMetric>('nivel')
    const selfEntry = useSelfLeaderboardEntry()

    const entries: LeaderboardEntry[] = [
        ...members.map(m => ({ ...m, isSelf: false })),
        ...(selfEntry ? [selfEntry] : [])
    ]
    const ranked = rankMembers(entries, metric)

    return (
        <div className='flex flex-col gap-2.5'>
            <div className='flex items-center justify-between'>
                <span className='text-text-muted text-xs font-semibold tracking-wider uppercase'>
                    {title ?? 'Ranking'}
                </span>
                <div className='flex gap-1'>
                    {METRICS.map(m => (
                        <button
                            key={m.id}
                            type='button'
                            onClick={() => setMetric(m.id)}
                            className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider uppercase ${
                                metric === m.id ? 'bg-accent text-accent-ink' : 'border-border text-text-muted border'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {ranked.length === 0 && <p className='text-text-muted text-sm'>Nadie para mostrar todavía.</p>}

            <div className='flex flex-col gap-2'>
                {ranked.map((entry, index) => (
                    <div
                        key={entry.id}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                            entry.isSelf ? 'border-accent bg-accent/10' : 'border-border bg-surface'
                        }`}
                    >
                        <div className='flex items-center gap-3'>
                            <span className='text-text-muted w-4 font-mono text-xs'>{index + 1}</span>
                            <span className='text-text text-[15px] font-medium'>
                                {entry.username}
                                {entry.isSelf && <span className='text-text-muted text-xs'> (vos)</span>}
                            </span>
                        </div>
                        {entry.profileSnapshot ? (
                            <span className='text-text-muted font-mono text-xs'>
                                Nivel {entry.profileSnapshot.nivel} · {entry.profileSnapshot.xpTotal} XP ·{' '}
                                {entry.profileSnapshot.rachaMaxima} sem
                            </span>
                        ) : (
                            <span className='text-text-muted font-mono text-xs'>Sin datos todavía</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
