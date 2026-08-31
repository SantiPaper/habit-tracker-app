import { useState } from 'react'

import { useUpdateSetting } from '../hooks/use-update-setting'
import { SETTING_DESCRIPTIONS, SETTING_LABELS, type Settings, type SettingKey } from '../types/settings.types'

import { useToastStore } from '@/core/stores/toast-store'

const SETTING_KEYS: SettingKey[] = [
    'xpPorCumplido',
    'xpSemanaPerfecta',
    'xpMesPerfecta',
    'xpPorMesRacha',
    'nivelDivisor'
]

export function SettingsForm({ settings }: { settings: Settings }) {
    const [values, setValues] = useState<Record<SettingKey, string>>(
        () => Object.fromEntries(SETTING_KEYS.map(key => [key, String(settings[key])])) as Record<SettingKey, string>
    )
    const [isSaving, setIsSaving] = useState(false)
    const updateSettingMutation = useUpdateSetting()

    async function handleSave() {
        setIsSaving(true)
        try {
            const changedKeys = SETTING_KEYS.filter(key => Number(values[key]) !== settings[key])
            await Promise.all(
                changedKeys.map(key => updateSettingMutation.mutateAsync({ key, value: Number(values[key]) }))
            )
            useToastStore.getState().addToast('success', 'Configuración guardada')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6'>
            <div className='flex flex-col gap-4'>
                {SETTING_KEYS.map(key => (
                    <div key={key} className='flex items-center justify-between gap-6'>
                        <div className='flex flex-col gap-0.5'>
                            <span className='text-text text-sm font-medium'>{SETTING_LABELS[key]}</span>
                            <span className='text-text-muted max-w-md text-xs'>{SETTING_DESCRIPTIONS[key]}</span>
                        </div>
                        <input
                            type='number'
                            min={key === 'nivelDivisor' ? 1 : 0}
                            value={values[key]}
                            onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))}
                            className='border-border bg-bg text-text w-24 shrink-0 rounded-lg border px-3 py-2 text-right font-mono text-sm'
                        />
                    </div>
                ))}
            </div>

            <button
                type='button'
                onClick={handleSave}
                disabled={isSaving}
                className='bg-accent text-accent-ink self-start rounded-lg px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50'
            >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
        </div>
    )
}
