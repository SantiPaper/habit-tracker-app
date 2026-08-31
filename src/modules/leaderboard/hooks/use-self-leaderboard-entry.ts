import type { LeaderboardEntry } from '../types/leaderboard.types'

import { useSessionStore } from '@/modules/account/store/session-store'
import { useXpSummary } from '@/modules/gamification/hooks/use-xp-summary'
import { useRachaMaxima } from '@/modules/profile/hooks/use-racha-maxima'

/** Compone nivel/XP/racha propios (ya calculados localmente) en la misma forma que una fila de amigo, marcada `isSelf`. */
export function useSelfLeaderboardEntry(): LeaderboardEntry | null {
    const session = useSessionStore(state => state.session)
    const { data: xpSummary } = useXpSummary()
    const { data: rachaMaxima } = useRachaMaxima()

    if (!session || !xpSummary || rachaMaxima === undefined) return null

    return {
        id: session.userId,
        username: session.username,
        profileSnapshot: {
            nivel: xpSummary.nivel,
            xpTotal: xpSummary.xpTotal,
            rachaMaxima,
            updatedAt: new Date().toISOString()
        },
        isSelf: true
    }
}
