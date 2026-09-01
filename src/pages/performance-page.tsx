import { PerformanceCalendar } from '@/modules/performance/components/performance-calendar'

export function PerformancePage() {
    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-6 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>
                    Rendimiento
                </div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Rendimiento</h2>
                <p className='text-text-muted mt-1 text-sm'>
                    Cuánto mantuviste tus hábitos de control diario, día por día.
                </p>
            </div>

            <PerformanceCalendar />
        </div>
    )
}
