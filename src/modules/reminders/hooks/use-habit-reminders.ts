import { isPermissionGranted, sendNotification } from '@tauri-apps/plugin-notification'
import { parseISO } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

import { toDateKey } from '@/lib/date/period'
import { useHabitsForDate } from '@/modules/daily/hooks/use-habits-for-date'
import { getBlocksForDate } from '@/modules/habits/lib/schedule-blocks'

const DAY_CHECK_INTERVAL_MS = 60_000

/**
 * Programa una notificación nativa para cada hábito de hoy con `hora` definida y todavía sin
 * marcar. Solo funciona mientras la app está abierta — no hay tareas en segundo plano fuera de
 * eso, es una limitación real de este enfoque (más simple que armar una tarea programada del SO).
 * Se reprograma solo cada vez que cambian los hábitos/estados de hoy (incluye: tildar uno,
 * crear/editar un hábito, o que cambie el día).
 */
export function useHabitReminders() {
    const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()))

    // Detecta el cambio de día si la app queda abierta pasada la medianoche.
    useEffect(() => {
        const interval = setInterval(() => {
            const currentKey = toDateKey(new Date())
            setTodayKey(prev => (prev === currentKey ? prev : currentKey))
        }, DAY_CHECK_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    const today = parseISO(todayKey)
    const { data: items } = useHabitsForDate(today)
    const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([])

    useEffect(() => {
        timeoutIdsRef.current.forEach(clearTimeout)
        timeoutIdsRef.current = []

        if (!items || items.length === 0) return

        let cancelled = false

        isPermissionGranted().then(granted => {
            if (!granted || cancelled) return

            const now = new Date()

            for (const { habit, estado } of items) {
                if (estado !== null) continue

                for (const block of getBlocksForDate(habit, today)) {
                    const [hours, minutes] = block.hora.split(':').map(Number)
                    const target = new Date(now)
                    target.setHours(hours, minutes, 0, 0)

                    const delay = target.getTime() - now.getTime()
                    if (delay <= 0) continue // ya pasó esa hora hoy

                    const timeoutId = setTimeout(() => {
                        void sendNotification({
                            title: habit.nombre,
                            body: `Programado para las ${block.hora}${block.duracionMinutos ? ` · ${block.duracionMinutos} min` : ''}`
                        })
                    }, delay)
                    timeoutIdsRef.current.push(timeoutId)
                }
            }
        })

        return () => {
            cancelled = true
            timeoutIdsRef.current.forEach(clearTimeout)
        }
        // `today` no entra a propósito: es un `Date` nuevo en cada render (`parseISO(todayKey)`),
        // pero ya cambia junto con `items` (la query de hoy se re-arma cuando cambia `todayKey`).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items])
}
