import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification'
import { useEffect, useState } from 'react'

export function useNotificationPermission() {
    const [granted, setGranted] = useState<boolean | null>(null) // null = todavía no se sabe

    useEffect(() => {
        isPermissionGranted().then(setGranted)
    }, [])

    const request = async () => {
        const alreadyGranted = await isPermissionGranted()
        if (alreadyGranted) {
            setGranted(true)
            return
        }
        const permission = await requestPermission()
        setGranted(permission === 'granted')
    }

    return { granted, request }
}
