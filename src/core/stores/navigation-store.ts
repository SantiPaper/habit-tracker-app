import { create } from 'zustand'

export type Tab = 'habits' | 'summary' | 'agenda' | 'alerts' | 'friends' | 'profile' | 'settings'

interface NavigationState {
    tab: Tab
    setTab: (tab: Tab) => void
}

export const useNavigationStore = create<NavigationState>(set => ({
    tab: 'agenda',
    setTab: tab => set({ tab })
}))
