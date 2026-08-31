/**
 * Insignia de "cumplido" — un círculo chico con tilde, al lado del nombre del hábito. Reemplaza
 * un primer intento de cinta diagonal que quedaba demasiado grande para tarjetas cortas (tapaba
 * los botones de estado) — esta va inline en el flujo normal, sin position:absolute, así que no
 * hay riesgo de que se superponga con nada ni de que se corte mal.
 */
export function CumplidoBadge() {
    return (
        <span
            aria-hidden
            className='flex h-4 w-4 shrink-0 items-center justify-center rounded-full'
            style={{ backgroundColor: 'var(--color-accent)' }}
        >
            <svg
                width='9'
                height='9'
                viewBox='0 0 24 24'
                fill='none'
                stroke='var(--color-accent-ink)'
                strokeWidth='4'
                strokeLinecap='round'
                strokeLinejoin='round'
            >
                <polyline points='4 12 10 18 20 6' />
            </svg>
        </span>
    )
}
