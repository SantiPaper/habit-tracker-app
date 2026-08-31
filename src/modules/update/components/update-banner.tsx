import { useState } from 'react'

import { useAppUpdate } from '../hooks/use-app-update'

/**
 * Banner de actualización disponible. A diferencia de `RemindersBanner`, "Más tarde" NO se guarda
 * en localStorage como "nunca más" — solo oculta el banner hasta el próximo reinicio (o hasta que
 * aparezca una versión más nueva que la pospuesta), para no dejar a alguien sin enterarse de
 * actualizaciones futuras con un solo clic.
 */
export function UpdateBanner() {
    const { available, version, installing, install } = useAppUpdate()
    const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)

    if (!available || version === null || dismissedVersion === version) return null

    return (
        <div className='border-border bg-surface fixed bottom-6 left-6 z-40 flex w-80 flex-col gap-3 rounded-2xl border p-4 shadow-lg'>
            <div className='flex flex-col gap-1'>
                <span className='text-text text-sm font-semibold'>Actualización disponible</span>
                <span className='text-text-muted text-xs'>
                    Hay una nueva versión de Habit Tracker (v{version}) lista para instalar.
                </span>
            </div>
            <div className='flex justify-end gap-2'>
                <button
                    type='button'
                    onClick={() => setDismissedVersion(version)}
                    disabled={installing}
                    className='border-border text-text-muted rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-60'
                >
                    Más tarde
                </button>
                <button
                    type='button'
                    onClick={() => void install()}
                    disabled={installing}
                    className='bg-accent text-accent-ink rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60'
                >
                    {installing ? 'Actualizando…' : 'Actualizar ahora'}
                </button>
            </div>
        </div>
    )
}
