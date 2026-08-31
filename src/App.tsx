import type { JSX } from 'react'

import { ToastContainer } from '@/components/toast-container'
import { useNavigationStore, type Tab } from '@/core/stores/navigation-store'
import { useHydrateSession } from '@/modules/account/hooks/use-hydrate-session'
import { useProfileSync } from '@/modules/account/hooks/use-profile-sync'
import { XpHud } from '@/modules/gamification/components/xp-hud'
import { RemindersBanner } from '@/modules/reminders/components/reminders-banner'
import { useHabitReminders } from '@/modules/reminders/hooks/use-habit-reminders'
import { UpdateBanner } from '@/modules/update/components/update-banner'
import { AgendaPage } from '@/pages/agenda-page'
import { FriendsPage } from '@/pages/friends-page'
import { HabitsPage } from '@/pages/habits-page'
import { ProfilePage } from '@/pages/profile-page'
import { SettingsPage } from '@/pages/settings-page'
import { SummaryPage } from '@/pages/summary-page'

function HabitsIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <rect x='3' y='4' width='18' height='18' rx='2' />
            <path d='M3 10h18' />
            <path d='M8 2v4M16 2v4' />
        </svg>
    )
}

function SummaryIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M3 3v18h18' />
            <path d='M7 15l4-4 3 3 5-6' />
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <rect x='3' y='4' width='18' height='18' rx='2' />
            <path d='M3 9h18' />
            <path d='M8 2v4M16 2v4' />
            <path d='M7 14h1M12 14h1M17 14h1M7 18h1M12 18h1' />
        </svg>
    )
}

function FriendsIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <circle cx='9' cy='8' r='3' />
            <path d='M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6' />
            <path d='M17 8.5a2.5 2.5 0 1 0-1-4.8' />
            <path d='M21.5 19.7c-.2-2.9-2.3-5-5-5.5' />
        </svg>
    )
}

function ProfileIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <circle cx='12' cy='8' r='4' />
            <path d='M4 21c0-4 3.5-7 8-7s8 3 8 7' />
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <circle cx='12' cy='12' r='3' />
            <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
        </svg>
    )
}

const TABS: { id: Tab; label: string; Icon: () => JSX.Element }[] = [
    { id: 'habits', label: 'Hábitos', Icon: HabitsIcon },
    { id: 'agenda', label: 'Agenda', Icon: CalendarIcon },
    { id: 'summary', label: 'Resumen', Icon: SummaryIcon },
    { id: 'friends', label: 'Amigos', Icon: FriendsIcon },
    { id: 'profile', label: 'Perfil', Icon: ProfileIcon },
    { id: 'settings', label: 'Configuración', Icon: SettingsIcon }
]

function App() {
    const tab = useNavigationStore(state => state.tab)
    const setTab = useNavigationStore(state => state.setTab)

    useHabitReminders()
    useHydrateSession()
    useProfileSync()

    return (
        <main className='bg-bg min-h-screen'>
            <nav className='border-border flex items-center justify-between gap-1 border-b px-4 pt-3'>
                <div className='flex gap-1'>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 rounded-t-lg border px-4 py-2.5 text-sm font-semibold ${
                                tab === t.id
                                    ? 'border-border border-b-bg bg-bg text-text'
                                    : 'text-text-muted border-transparent'
                            }`}
                            style={tab === t.id ? { marginBottom: '-1px' } : undefined}
                        >
                            <span className={tab === t.id ? 'text-accent' : ''}>
                                <t.Icon />
                            </span>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className='mb-2'>
                    <XpHud />
                </div>
            </nav>

            {tab === 'habits' && <HabitsPage />}
            {tab === 'agenda' && <AgendaPage />}
            {tab === 'summary' && <SummaryPage />}
            {tab === 'friends' && <FriendsPage />}
            {tab === 'profile' && <ProfilePage />}
            {tab === 'settings' && <SettingsPage />}

            <ToastContainer />
            <RemindersBanner />
            <UpdateBanner />
        </main>
    )
}

export default App
