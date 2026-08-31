import { useState } from 'react'

import type { Habit } from '../types/habit.types'

import { EditHabitDialog } from './edit-habit-dialog'
import { ImportanciaLabel } from './importancia-label'

import { ConfirmDialog } from '@/components/confirm-dialog'

const TIPO_BADGE_LABELS: Record<Habit['tipo'], string> = {
    diario_recurrente: 'Recurrente',
    diario_unico: 'Único',
    semanal: 'Semanal',
    mensual: 'Mensual'
}

const TIPO_BADGE_COLORS: Record<Habit['tipo'], string> = {
    diario_recurrente: 'text-accent',
    diario_unico: 'text-text-muted',
    semanal: 'text-accent-2',
    mensual: 'text-accent-2'
}

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function EditIcon() {
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
            <path d='M12 20h9' />
            <path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z' />
        </svg>
    )
}

function TrashIcon() {
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
            <polyline points='3 6 5 6 21 6' />
            <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
            <path d='M10 11v6M14 11v6' />
            <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
        </svg>
    )
}

interface HabitListItemProps {
    habit: Habit
    onDelete: (habit: Habit) => void
}

export function HabitListItem({ habit, onDelete }: HabitListItemProps) {
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)

    // Si todos los bloques cubren exactamente los mismos días que el hábito (el caso común, 0-1
    // bloque), no repetimos los días acá — ya se muestran arriba. Si varían entre bloques (ej. el
    // martes es distinto), sí los mostramos por bloque para que se entienda cuál es cuál.
    const blocksAreUniform = habit.scheduleBlocks.every(
        block =>
            block.diasSemana.length === (habit.diasSemana?.length ?? 0) &&
            block.diasSemana.every(d => habit.diasSemana?.includes(d))
    )

    return (
        <li
            className='bg-surface border-border flex items-center justify-between rounded-xl border border-l-4 py-3.5 pr-5 pl-4'
            style={{ borderLeftColor: habit.color ?? 'var(--color-border)' }}
        >
            <div className='flex flex-col gap-0.5'>
                <div className='flex items-center gap-2'>
                    <span className='text-text text-[15px] font-medium'>{habit.nombre}</span>
                    <ImportanciaLabel importancia={habit.importancia} />
                </div>
                {habit.tipo === 'diario_recurrente' && habit.diasSemana && (
                    <span className='text-text-muted font-mono text-xs'>
                        {habit.diasSemana
                            .map(d => DIAS_CORTOS[d])
                            .join(' · ')
                            .toUpperCase()}
                    </span>
                )}
                {habit.tipo === 'diario_unico' && habit.fecha && (
                    <span className='text-text-muted font-mono text-xs'>{habit.fecha}</span>
                )}
                {habit.tipo === 'diario_recurrente'
                    ? habit.scheduleBlocks.map(block => (
                          <span key={block.id} className='text-text-muted font-mono text-xs'>
                              {!blocksAreUniform && `${block.diasSemana.map(d => DIAS_CORTOS[d]).join(' · ')} · `}
                              {block.hora}
                              {block.duracionMinutos ? ` · ${block.duracionMinutos} min` : ''}
                          </span>
                      ))
                    : (habit.hora || habit.duracionMinutos) && (
                          <span className='text-text-muted font-mono text-xs'>
                              {[habit.hora, habit.duracionMinutos ? `${habit.duracionMinutos} min` : null]
                                  .filter(Boolean)
                                  .join(' · ')}
                          </span>
                      )}
            </div>
            <div className='flex items-center gap-3'>
                <span
                    className={`bg-surface-2 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider uppercase ${TIPO_BADGE_COLORS[habit.tipo]}`}
                >
                    {TIPO_BADGE_LABELS[habit.tipo]}
                </span>
                <button
                    type='button'
                    onClick={() => setEditOpen(true)}
                    aria-label={`Editar ${habit.nombre}`}
                    className='text-text-muted hover:text-accent'
                >
                    <EditIcon />
                </button>
                <button
                    type='button'
                    onClick={() => setConfirmOpen(true)}
                    aria-label={`Eliminar ${habit.nombre}`}
                    className='text-text-muted hover:text-red-400'
                >
                    <TrashIcon />
                </button>
            </div>

            {editOpen && <EditHabitDialog habit={habit} onClose={() => setEditOpen(false)} />}

            {confirmOpen && (
                <ConfirmDialog
                    title={`Eliminar "${habit.nombre}"`}
                    description='Se deja de trackear a partir de hoy. El historial de días ya cumplidos se conserva.'
                    onConfirm={() => {
                        onDelete(habit)
                        setConfirmOpen(false)
                    }}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}
        </li>
    )
}
