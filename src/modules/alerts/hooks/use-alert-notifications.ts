import { isPermissionGranted, sendNotification } from '@tauri-apps/plugin-notification'
import { useEffect } from 'react'

import type { AlertItem } from '../types/alert.types'

import { useUpcomingAlerts } from './use-upcoming-alerts'

const NOTIFIED_KEY = 'alerts-notified-today'

function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10)
}

function alertItemId(item: AlertItem): string {
    return item.kind === 'event' ? `event:${item.event.id}` : `project:${item.project.id}`
}

/**
 * Notificación nativa para lo que vence hoy — mismo patrón de `use-habit-reminders.ts`
 * (permiso + `sendNotification`), pero acá el dedupe es contra `localStorage` (keyeado por día,
 * mismo criterio de riesgo que `friend-activity.ts`: perderlo en el peor caso repite un aviso, no
 * rompe nada) en vez de `setTimeout` por ítem — no hay una "hora" en eventos/proyectos, solo un día.
 */
export function useAlertNotifications() {
    const { data: items } = useUpcomingAlerts()

    useEffect(() => {
        if (!items) return

        const dueToday = items.filter(item => item.diasHasta === 0)
        if (dueToday.length === 0) return

        let seenIds: string[] = []
        try {
            const stored = localStorage.getItem(NOTIFIED_KEY)
            const parsed = stored ? (JSON.parse(stored) as { day: string; ids: string[] }) : null
            seenIds = parsed && parsed.day === getTodayKey() ? parsed.ids : []
        } catch {
            seenIds = []
        }

        const seen = new Set(seenIds)
        const toNotify = dueToday.filter(item => !seen.has(alertItemId(item)))
        if (toNotify.length === 0) return

        let cancelled = false
        isPermissionGranted().then(granted => {
            if (!granted || cancelled) return
            for (const item of toNotify) {
                void sendNotification({
                    title: item.kind === 'event' ? 'Evento hoy' : 'Proyecto vence hoy',
                    body: item.kind === 'event' ? item.event.nombre : item.project.nombre
                })
            }
        })

        try {
            localStorage.setItem(NOTIFIED_KEY, JSON.stringify({ day: getTodayKey(), ids: dueToday.map(alertItemId) }))
        } catch {
            // Sin localStorage no hay dedupe entre sesiones — en el peor caso se repite un aviso, no rompe nada.
        }

        return () => {
            cancelled = true
        }
    }, [items])
}
