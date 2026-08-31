import type { CSSProperties } from 'react'

import { EstadoToggle } from '@/components/estado-toggle'
import { useFlashOnTrue } from '@/lib/hooks/use-flash-on-true'
import { useNow } from '@/lib/hooks/use-now'
import { CumplidoBadge } from '@/modules/habits/components/cumplido-badge'
import { ImportanciaLabel } from '@/modules/habits/components/importancia-label'
import { ESTADO_COLORS, ESTADO_LABELS } from '@/modules/habits/lib/estado-display'
import { isImportanceOverdue } from '@/modules/habits/lib/importance-alert'
import type { ScheduleSlot } from '@/modules/habits/lib/schedule-blocks'
import type { EstadoLog } from '@/modules/habits/types/habit-log.types'
import type { Habit } from '@/modules/habits/types/habit.types'
import { useImportanciaColors } from '@/modules/profile/hooks/use-importancia-colors'

const DIAS_CORTOS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

interface DailyCheckoffItemProps {
    habit: Habit
    estado: EstadoLog | null
    onChange: (estado: EstadoLog | null) => void
    /** Bloques de horario de este hábito para la fecha mostrada (`getBlocksForDate(habit, date)`) — puede ser más de uno. */
    blocks: ScheduleSlot[]
    /** Habilita el destello al completar y la alerta de importancia alta atrasada — solo tiene sentido para hoy. */
    isToday?: boolean
}

export function DailyCheckoffItem({ habit, estado, onChange, blocks, isToday }: DailyCheckoffItemProps) {
    const flashing = useFlashOnTrue(estado === 'cumplido')
    const now = useNow()
    const { data: importanciaColors } = useImportanciaColors()
    const overdue = isToday === true && isImportanceOverdue(habit, estado, now, blocks)
    const alertColor = importanciaColors?.alta

    const scheduleLabel =
        habit.tipo === 'diario_recurrente' && habit.diasSemana
            ? habit.diasSemana.map(d => DIAS_CORTOS[d]).join(' · ')
            : 'ÚNICO'

    const horariosLabel =
        blocks.length > 0
            ? blocks
                  .map(block => `${block.hora}${block.duracionMinutos ? ` · ${block.duracionMinutos} min` : ''}`)
                  .join(', ')
            : null

    const metaLabel = estado ? ESTADO_LABELS[estado] : [horariosLabel, scheduleLabel].filter(Boolean).join(' · ')

    return (
        <div
            className={`bg-surface border-border flex items-center justify-between rounded-xl border border-l-4 py-4 pr-5 pl-4 ${estado === 'pausado' ? 'opacity-75' : ''} ${flashing ? 'spark-pulse' : ''} ${overdue ? 'importance-alert-pulse' : ''}`}
            style={
                {
                    borderLeftColor: habit.color ?? 'var(--color-border)',
                    ...(flashing ? { '--spark-color': habit.color ?? 'var(--color-accent)' } : undefined),
                    ...(overdue && alertColor ? { '--alert-color': alertColor } : undefined)
                } as CSSProperties
            }
        >
            <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                    <span className='text-text text-[15px] font-medium'>{habit.nombre}</span>
                    <ImportanciaLabel importancia={habit.importancia} />
                    {estado === 'cumplido' && <CumplidoBadge />}
                </div>
                <span className={`font-mono text-xs ${estado ? ESTADO_COLORS[estado] : 'text-text-muted'}`}>
                    {metaLabel}
                </span>
            </div>
            <EstadoToggle value={estado} onChange={onChange} />
        </div>
    )
}
