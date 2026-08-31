import { useEffect, useState } from 'react'

/** Hora actual, refrescada cada `intervalMs` — para UI que depende de "ahora" sin pasar por props. */
export function useNow(intervalMs = 60_000): Date {
    const [now, setNow] = useState(() => new Date())

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs)
        return () => clearInterval(id)
    }, [intervalMs])

    return now
}
