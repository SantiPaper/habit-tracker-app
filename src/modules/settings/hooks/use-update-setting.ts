import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setSetting } from '../services/settings.service'
import type { SettingKey } from '../types/settings.types'

import { settingsQueryKey } from './use-settings'

import { useToastStore } from '@/core/stores/toast-store'

export function useUpdateSetting() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ key, value }: { key: SettingKey; value: number }) => setSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsQueryKey })
            queryClient.invalidateQueries({ queryKey: ['gamification'] })
        },
        onError: error => {
            console.error('[update-setting] failed', error)
            useToastStore.getState().addToast('error', 'No se pudo guardar la configuración')
        }
    })
}
