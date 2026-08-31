import { useImportanciaColors } from '../hooks/use-importancia-colors'
import { useSetImportanciaColor } from '../hooks/use-set-importancia-color'

import type { HabitImportancia } from '@/modules/habits/types/habit.types'

const LEVELS: { value: HabitImportancia; label: string }[] = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' }
]

/** Colores de las etiquetas Alta/Media/Baja — configurable acá (Perfil), no en Configuración, a pedido explícito del usuario. */
export function ImportanciaColorsSettings() {
    const { data: colors } = useImportanciaColors()
    const setColorMutation = useSetImportanciaColor()

    if (!colors) return null

    return (
        <div className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6'>
            <div className='flex flex-col gap-1'>
                <span className='text-text text-sm font-semibold'>Colores de importancia</span>
                <span className='text-text-muted text-xs'>
                    El color de la etiqueta Alta/Media/Baja en tu lista de hábitos.
                </span>
            </div>

            <div className='flex flex-col gap-3'>
                {LEVELS.map(level => (
                    <div key={level.value} className='flex items-center justify-between gap-4'>
                        <span className='text-text text-sm'>{level.label}</span>
                        <input
                            type='color'
                            value={colors[level.value]}
                            onChange={e => setColorMutation.mutate({ nivel: level.value, color: e.target.value })}
                            className='border-border h-9 w-14 cursor-pointer rounded-lg border bg-transparent p-1'
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
