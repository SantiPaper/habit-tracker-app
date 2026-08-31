import type { HabitImportancia } from '../types/habit.types'

import { useImportanciaColors } from '@/modules/profile/hooks/use-importancia-colors'

const LABELS: Record<HabitImportancia, string> = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja'
}

/** Pill de Alta/Media/Baja con el color configurado en Perfil — reusado en Hábitos y Agenda. */
export function ImportanciaLabel({ importancia }: { importancia: HabitImportancia }) {
    const { data: colors } = useImportanciaColors()
    const color = colors?.[importancia]

    if (!color) return null

    return (
        <span
            className='shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase'
            style={{ backgroundColor: `${color}22`, color }}
        >
            {LABELS[importancia]}
        </span>
    )
}
