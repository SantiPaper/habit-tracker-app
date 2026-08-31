import { create } from 'zustand'

import type { Session } from '../types/account.types'

interface SessionState {
    session: Session | null
    /** `false` hasta que se termina de leer la sesión guardada en el arranque — evita mostrar el login de golpe y después la sesión real. */
    hydrated: boolean
    setSession: (session: Session | null) => void
    setHydrated: () => void
}

export const useSessionStore = create<SessionState>(set => ({
    session: null,
    hydrated: false,
    setSession: session => set({ session }),
    setHydrated: () => set({ hydrated: true })
}))
