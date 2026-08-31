import type { SelectHTMLAttributes } from 'react'

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

/** Un `<select>` sin el look nativo del navegador — mismo look que el resto de los inputs, con una flechita propia. */
export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className='relative'>
            <select
                {...props}
                className={`border-border bg-bg text-text focus:border-accent w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm transition-colors outline-none ${className ?? ''}`}
            />
            <span className='text-text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2'>
                <ChevronIcon />
            </span>
        </div>
    )
}
