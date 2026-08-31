import { eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns'

export function getMonthGridDays(monthAnchor: Date): Date[] {
    const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
}
