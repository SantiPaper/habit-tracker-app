import { useEffect, useRef, useState } from 'react'

/**
 * `true` durante `durationMs` cada vez que `flag` pasa de `false` a `true` — para disparar un
 * destello visual puntual (clase `spark-pulse`) sin persistir nada. No se dispara en el primer
 * render aunque `flag` ya arranque en `true` (evita destellos falsos al cargar datos que ya
 * estaban completados de antes).
 */
export function useFlashOnTrue(flag: boolean, durationMs = 600): boolean {
    const [flashing, setFlashing] = useState(false)
    const prevRef = useRef(flag)

    useEffect(() => {
        const prev = prevRef.current
        prevRef.current = flag

        if (flag && !prev) {
            setFlashing(true)
            const timeout = setTimeout(() => setFlashing(false), durationMs)
            return () => clearTimeout(timeout)
        }
    }, [flag, durationMs])

    return flashing
}
