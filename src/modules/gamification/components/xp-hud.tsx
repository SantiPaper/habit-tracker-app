import { useXpSummary } from '../hooks/use-xp-summary'

import { useNavigationStore } from '@/core/stores/navigation-store'
import { useSessionStore } from '@/modules/account/store/session-store'

export function XpHud() {
    const session = useSessionStore(state => state.session)
    const { data: xp } = useXpSummary()

    if (!session) {
        return (
            <button
                type='button'
                onClick={() => useNavigationStore.getState().setTab('profile')}
                className='border-border text-text-muted hover:border-text-muted hover:text-text rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors'
            >
                Iniciá sesión
            </button>
        )
    }

    if (!xp) return null

    const percent = xp.xpParaProximoNivel > 0 ? Math.round((xp.xpEnNivel / xp.xpParaProximoNivel) * 100) : 0

    return (
        <div className='border-border bg-surface flex items-center gap-2.5 rounded-full border px-3 py-1.5'>
            <span className='bg-accent text-accent-ink rounded-full px-2 py-0.5 font-mono text-[11px] font-bold'>
                NIVEL {xp.nivel}
            </span>
            <div className='bg-surface-2 h-1.5 w-20 overflow-hidden rounded-full'>
                <div className='bg-accent h-full rounded-full' style={{ width: `${percent}%` }} />
            </div>
            <span className='text-text-muted font-mono text-[11px]'>{xp.xpTotal} XP</span>
        </div>
    )
}
