import { useToastStore } from '@/core/stores/toast-store'

export function ToastContainer() {
    const toasts = useToastStore(state => state.toasts)
    const removeToast = useToastStore(state => state.removeToast)

    if (toasts.length === 0) return null

    return (
        <div className='fixed right-6 bottom-6 z-50 flex flex-col gap-2'>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    role='status'
                    className='border-border bg-surface text-text flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg'
                >
                    <span className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-accent' : 'bg-red-400'}`} />
                    {toast.message}
                    <button
                        type='button'
                        onClick={() => removeToast(toast.id)}
                        aria-label='Cerrar'
                        className='text-text-muted ml-2'
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}
