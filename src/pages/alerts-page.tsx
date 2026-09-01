import { AlertsList } from '@/modules/alerts/components/alerts-list'

export function AlertsPage() {
    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-6 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>Alertas</div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Alertas</h2>
                <p className='text-text-muted mt-1 text-sm'>Eventos y proyectos que se vienen, en un solo lugar.</p>
            </div>

            <AlertsList />
        </div>
    )
}
