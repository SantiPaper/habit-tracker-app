import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { useSyncStatusStore } from '../store/sync-status-store'

/** Umbral a partir del cual "hace X" deja de ser normal y pasa a ser una alerta — bien por arriba del poll de respaldo (5min) para no gritar por un corte momentáneo. */
const STALE_THRESHOLD_MS = 24 * 60 * 60_000

export function SyncStatusBadge() {
    const lastSyncedAt = useSyncStatusStore(state => state.lastSyncedAt)
    const lastErrorMessage = useSyncStatusStore(state => state.lastErrorMessage)

    const isStale = lastSyncedAt === null || Date.now() - parseISO(lastSyncedAt).getTime() > STALE_THRESHOLD_MS
    const warn = isStale || lastErrorMessage !== null

    const label = lastSyncedAt
        ? `Última sincronización: ${formatDistanceToNow(parseISO(lastSyncedAt), { addSuffix: true, locale: es })}`
        : 'Todavía no sincronizó en este dispositivo'

    return (
        <div className={`font-mono text-xs ${warn ? 'text-amber-500' : 'text-text-muted'}`}>
            {warn && '⚠️ '}
            {label}
            {lastErrorMessage && <span className='block opacity-70'>Último error: {lastErrorMessage}</span>}
        </div>
    )
}
