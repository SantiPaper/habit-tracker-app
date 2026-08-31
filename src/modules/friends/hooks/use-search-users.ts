import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { searchUsers } from '../services/friends-api.service'

const DEBOUNCE_MS = 300

/** Búsqueda con debounce simple — no dispara una request por cada tecla. */
export function useSearchUsers(query: string) {
    const [debounced, setDebounced] = useState(query)

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(query), DEBOUNCE_MS)
        return () => clearTimeout(timeout)
    }, [query])

    return useQuery({
        queryKey: ['friends', 'search', debounced],
        queryFn: () => searchUsers(debounced),
        enabled: debounced.trim().length > 0
    })
}
