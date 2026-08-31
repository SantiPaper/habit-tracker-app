import type { LeaderboardEntry, LeaderboardMetric } from '../types/leaderboard.types'

/** Sort puro descendente por la métrica elegida — sin snapshot todavía se va al final. */
export function rankMembers(entries: LeaderboardEntry[], metric: LeaderboardMetric): LeaderboardEntry[] {
    return [...entries].sort((a, b) => {
        const valueA = a.profileSnapshot?.[metric] ?? -1
        const valueB = b.profileSnapshot?.[metric] ?? -1
        return valueB - valueA
    })
}
