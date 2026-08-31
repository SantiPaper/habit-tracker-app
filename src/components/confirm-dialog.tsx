interface ConfirmDialogProps {
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    title,
    description,
    confirmLabel = 'Eliminar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onCancel}>
            <div
                className='border-border bg-surface flex w-80 flex-col gap-4 rounded-2xl border p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex flex-col gap-1.5'>
                    <span className='text-text text-base font-semibold'>{title}</span>
                    <span className='text-text-muted text-sm'>{description}</span>
                </div>
                <div className='flex justify-end gap-2'>
                    <button
                        type='button'
                        onClick={onCancel}
                        className='border-border text-text-muted rounded-lg border px-4 py-2 text-sm font-medium'
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type='button'
                        onClick={onConfirm}
                        className='text-accent-ink rounded-lg bg-red-400 px-4 py-2 text-sm font-bold'
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
