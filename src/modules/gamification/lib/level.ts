export function getNivel(xpTotal: number, divisor: number): number {
    if (divisor <= 0) return 0
    return Math.floor(Math.sqrt(xpTotal / divisor))
}

export function getXpThreshold(nivel: number, divisor: number): number {
    return nivel * nivel * divisor
}
