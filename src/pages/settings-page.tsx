import { SettingsForm } from '@/modules/settings/components/settings-form'
import { useSettings } from '@/modules/settings/hooks/use-settings'

export function SettingsPage() {
    const { data: settings, isLoading, error } = useSettings()

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-6 p-10'>
            <div>
                <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>
                    Configuración
                </div>
                <h2 className='text-text text-3xl font-bold tracking-tight'>Configuración</h2>
            </div>

            {isLoading && <p className='text-text-muted'>Cargando...</p>}
            {error && <p className='text-red-400'>Error al cargar la configuración</p>}

            {settings && <SettingsForm settings={settings} />}
        </div>
    )
}
