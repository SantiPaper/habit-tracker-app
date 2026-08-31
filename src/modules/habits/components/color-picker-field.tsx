const DEFAULT_SWATCH = '#71717a'

interface ColorPickerFieldProps {
    value: string | null
    onChange: (value: string | null) => void
}

/** Color libre elegido por el usuario para el hábito — identidad visual, sin significado fijo (no es la importancia). */
export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
    return (
        <div className='flex items-center gap-2.5'>
            <input
                type='color'
                value={value ?? DEFAULT_SWATCH}
                onChange={e => onChange(e.target.value)}
                className='border-border h-10 w-14 cursor-pointer rounded-lg border bg-transparent p-1'
            />
            {value ? (
                <button type='button' onClick={() => onChange(null)} className='text-text-muted text-xs underline'>
                    Quitar color
                </button>
            ) : (
                <span className='text-text-muted text-xs'>Sin color (opcional)</span>
            )}
        </div>
    )
}
