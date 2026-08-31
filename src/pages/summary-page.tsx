import { useState } from 'react'

import { RequiresAccountNotice } from '@/modules/account/components/requires-account-notice'
import { useSessionStore } from '@/modules/account/store/session-store'
import { AchievementsInfoDialog } from '@/modules/achievements/components/achievements-info-dialog'
import { useHabits } from '@/modules/habits/hooks/use-habits'
import { MensualProgressRow } from '@/modules/summary/components/mensual-progress-row'
import { RecurrenteProgressRow } from '@/modules/summary/components/recurrente-progress-row'
import { SemanalProgressRow } from '@/modules/summary/components/semanal-progress-row'

function InfoIcon() {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <circle cx='12' cy='12' r='10' />
            <path d='M12 16v-4' />
            <path d='M12 8h.01' />
        </svg>
    )
}

/**
 * Resumen: progreso + logros de racha, en una sola pantalla. Antes eran dos pestañas separadas
 * ("Resumen" y "Logros") mostrando cosas distintas del mismo hábito — el usuario no le vio
 * sentido a tenerlas separadas, así que cada hábito ahora es una sola fila con todo junto (rango
 * de liga, progreso de semana/mes, marcar el período, reclamos de XP).
 */
export function SummaryPage() {
    const [infoOpen, setInfoOpen] = useState(false)
    const session = useSessionStore(state => state.session)
    const hydrated = useSessionStore(state => state.hydrated)
    const { data: habits, isLoading, error } = useHabits()

    const recurrentes = habits?.filter(h => h.tipo === 'diario_recurrente' && h.activo) ?? []
    const semanales = habits?.filter(h => h.tipo === 'semanal' && h.activo) ?? []
    const mensuales = habits?.filter(h => h.tipo === 'mensual' && h.activo) ?? []

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-6 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Resumen</div>
                <div className='flex items-center gap-2.5'>
                    <h2 className='text-text text-3xl font-bold tracking-tight'>Resumen</h2>
                    <button
                        type='button'
                        onClick={() => setInfoOpen(true)}
                        aria-label='Cómo funcionan las ligas'
                        className='border-border text-text-muted hover:text-text flex h-6 w-6 items-center justify-center rounded-full border'
                    >
                        <InfoIcon />
                    </button>
                </div>
            </div>

            {!hydrated && <p className='text-text-muted'>Cargando...</p>}

            {hydrated && !session && (
                <RequiresAccountNotice message='Iniciá sesión para ver tu progreso, ligas y reclamar XP.' />
            )}

            {hydrated && session && (
                <>
                    {isLoading && <p className='text-text-muted'>Cargando...</p>}
                    {error && <p className='text-red-400'>Error al cargar el resumen</p>}

                    {habits && (
                        <div className='flex flex-col gap-2.5'>
                            {recurrentes.map(habit => (
                                <RecurrenteProgressRow key={habit.id} habit={habit} />
                            ))}
                            {semanales.map(habit => (
                                <SemanalProgressRow key={habit.id} habit={habit} />
                            ))}
                            {mensuales.map(habit => (
                                <MensualProgressRow key={habit.id} habit={habit} />
                            ))}

                            {recurrentes.length + semanales.length + mensuales.length === 0 && (
                                <p className='text-text-muted'>
                                    Todavía no tenés hábitos con progreso para mostrar acá.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}

            {infoOpen && <AchievementsInfoDialog onClose={() => setInfoOpen(false)} />}
        </div>
    )
}
