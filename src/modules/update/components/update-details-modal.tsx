interface UpdateDetailsModalProps {
    version: string
    notes: string | null
    installing: boolean
    onConfirm: () => void
    onCancel: () => void
}

/** Modal con el changelog (mensajes de commit desde la última versión, generados en CI) antes de instalar de verdad. */
export function UpdateDetailsModal({ version, notes, installing, onConfirm, onCancel }: UpdateDetailsModalProps) {
    const lines = (notes ?? '')
        .split('\n')
        .map(line => line.trim().replace(/^-\s*/, ''))
        .filter(Boolean)

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onCancel}>
            <div
                className='border-border bg-surface flex w-96 flex-col gap-4 rounded-2xl border p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-1.5'>
                    <span className='text-text text-base font-semibold'>Actualizar a v{version}</span>
                    <span className='text-text-muted text-sm'>Esto es lo que trae esta versión:</span>
                </div>

                {lines.length > 0 ? (
                    <ul className='flex list-disc flex-col gap-1.5 pl-4'>
                        {lines.map(line => (
                            <li key={line} className='text-text-muted text-sm'>
                                {line}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-text-muted text-sm'>Sin detalles para esta versión.</p>
                )}

                <div className='flex justify-end gap-2'>
                    <button
                        type='button'
                        onClick={onCancel}
                        disabled={installing}
                        className='border-border text-text-muted rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-60'
                    >
                        Cancelar
                    </button>
                    <button
                        type='button'
                        onClick={onConfirm}
                        disabled={installing}
                        className='bg-accent text-accent-ink rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60'
                    >
                        {installing ? 'Actualizando…' : 'Actualizar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
