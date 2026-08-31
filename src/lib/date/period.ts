import { format, getISOWeek, getISOWeekYear } from 'date-fns'

export function toDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd')
}

export function toIsoWeekKey(date: Date): string {
    const week = getISOWeek(date).toString().padStart(2, '0')
    return `${getISOWeekYear(date)}-W${week}`
}

export function toIsoMonthKey(date: Date): string {
    return format(date, 'yyyy-MM')
}
