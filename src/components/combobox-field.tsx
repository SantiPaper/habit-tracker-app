import { useEffect, useRef, useState } from 'react'

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxFieldProps {
    id?: string
    value: string
    onChange: (value: string) => void
    options: ComboboxOption[]
    className?: string
    disabled?: boolean
}

function ChevronIcon() {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M6 9l6 6 6-6' />
        </svg>
    )
}

/**
 * Select con dropdown propio, no nativo — el `<select>` del navegador no se puede estilizar por
 * dentro (la lista abierta la dibuja el sistema operativo), así que para listas largas (horas,
 * cada 15 min) se veía genérico/feo. Mismo look que el resto de los inputs, tanto cerrado como
 * abierto. Contrato controlado simple (`value`/`onChange` de string) — no reemplaza a
 * `SelectField` donde hace falta `register()` de react-hook-form (ahí un `<select>` nativo sigue
 * siendo necesario).
 */
export function ComboboxField({ id, value, onChange, options, className, disabled }: ComboboxFieldProps) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const selectedRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!open) return

        function handleClickOutside(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        selectedRef.current?.scrollIntoView({ block: 'nearest' })

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [open])

    const selected = options.find(o => o.value === value)

    return (
        <div ref={rootRef} className='relative'>
            <button
                type='button'
                id={id}
                disabled={disabled}
                onClick={() => setOpen(o => !o)}
                className={`border-border bg-bg text-text focus:border-accent flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors outline-none disabled:opacity-50 ${className ?? ''}`}
            >
                <span className='truncate'>{selected?.label ?? ''}</span>
                <span className={`text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
                    <ChevronIcon />
                </span>
            </button>

            {open && (
                <div className='border-border bg-surface absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border p-1 shadow-lg'>
                    {options.map(option => (
                        <button
                            key={option.value}
                            ref={option.value === value ? selectedRef : undefined}
                            type='button'
                            onClick={() => {
                                onChange(option.value)
                                setOpen(false)
                            }}
                            className={`w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                                option.value === value
                                    ? 'bg-accent text-accent-ink font-semibold'
                                    : 'text-text hover:bg-surface-2'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
