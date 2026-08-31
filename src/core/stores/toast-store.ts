import { create } from 'zustand'

export type ToastType = 'success' | 'error'

export interface Toast {
    id: string
    type: ToastType
    message: string
}

interface ToastState {
    toasts: Toast[]
    addToast: (type: ToastType, message: string) => void
    removeToast: (id: string) => void
}

const TOAST_DURATION_MS = 3500

export const useToastStore = create<ToastState>(set => ({
    toasts: [],
    addToast: (type, message) => {
        const id = crypto.randomUUID()
        set(state => ({ toasts: [...state.toasts, { id, type, message }] }))
        setTimeout(() => {
            set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }))
        }, TOAST_DURATION_MS)
    },
    removeToast: id => set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }))
}))
