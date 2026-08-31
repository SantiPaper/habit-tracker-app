import { useState } from 'react'

import { useNotificationPermission } from '../hooks/use-notification-permission'

const DISMISS_KEY = 'reminders-banner-dismissed'

/** Banner chico, una sola vez, pidiendo el permiso de notificaciones nativas — no vuelve a aparecer tras la primera interacción. */
export function RemindersBanner() {
    const { granted, request } = useNotificationPermission()
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(DISMISS_KEY) === '1'
        } catch {
            return false
        }
    })

    const dismiss = () => {
        try {
            localStorage.setItem(DISMISS_KEY, '1')
        } catch {
            // localStorage no disponible — no pasa nada, el banner puede volver a aparecer
        }
        setDismissed(true)
    }

    if (granted !== false || dismissed) return null

    return (
        <div className='border-border bg-surface fixed right-6 bottom-6 z-40 flex w-80 flex-col gap-3 rounded-2xl border p-4 shadow-lg'>
            <div className='flex flex-col gap-1'>
                <span className='text-text text-sm font-semibold'>Activar recordatorios</span>
                <span className='text-text-muted text-xs'>
                    Te avisamos con una notificación cuando llega la hora de un hábito programado (solo mientras la app
                    está abierta).
                </span>
            </div>
            <div className='flex justify-end gap-2'>
                <button
                    type='button'
                    onClick={dismiss}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-xs font-medium'
                >
                    Ahora no
                </button>
                <button
                    type='button'
                    onClick={() => {
                        void request()
                        dismiss()
                    }}
                    className='bg-accent text-accent-ink rounded-lg px-3 py-1.5 text-xs font-bold'
                >
                    Activar
                </button>
            </div>
        </div>
    )
}
