import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    error: Error | null
}

/**
 * Red de seguridad para toda la app — sin esto, un error de render no capturado en cualquier
 * componente (ej. un `null` inesperado) deja al usuario con pantalla blanca sin ningún mensaje.
 * Tiene que ser clase: no existe un hook equivalente a `getDerivedStateFromError`/`componentDidCatch`.
 * Un solo boundary en la raíz alcanza para esta app — no hay zonas donde tenga sentido que el resto
 * de la UI siga funcionando si el tab activo se rompió.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null }

    static getDerivedStateFromError(error: Error): State {
        return { error }
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('[error-boundary] render error no capturado', error, info.componentStack)
    }

    render() {
        if (!this.state.error) return this.props.children

        return (
            <main className='bg-bg flex min-h-screen items-center justify-center p-10'>
                <div className='border-border bg-surface flex max-w-md flex-col gap-4 rounded-xl border p-6'>
                    <div>
                        <div className='text-accent mb-1 font-mono text-xs font-bold tracking-widest uppercase'>
                            Ups
                        </div>
                        <h1 className='text-text text-xl font-bold tracking-tight'>Algo se rompió</h1>
                    </div>
                    <p className='text-text-muted text-sm'>
                        La app tuvo un error inesperado. Tus datos locales no se tocaron — probá recargar.
                    </p>
                    <button
                        type='button'
                        onClick={() => window.location.reload()}
                        className='bg-accent text-accent-ink w-fit rounded-lg px-4 py-2 text-sm font-semibold'
                    >
                        Recargar
                    </button>
                    <details className='text-text-muted text-xs'>
                        <summary className='cursor-pointer select-none'>Detalle técnico</summary>
                        <pre className='mt-2 overflow-x-auto whitespace-pre-wrap'>
                            {this.state.error.message}
                            {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
                        </pre>
                    </details>
                </div>
            </main>
        )
    }
}
