/**
 * Calendar utility functions for date calculations
 */

export interface CalendarDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
}

export interface CalendarWeek {
    days: CalendarDay[];
}

/**
 * Get the calendar grid for a given month
 */
export function getMonthCalendar(year: number, month: number): CalendarWeek[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate the start date (may be from previous month)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    const weeks: CalendarWeek[] = [];
    let currentDate = new Date(startDate);

    // Generate 6 weeks to ensure we always show a complete grid
    for (let week = 0; week < 6; week++) {
        const days: CalendarDay[] = [];

        for (let day = 0; day < 7; day++) {
            const dateToCheck = new Date(currentDate);
            const isCurrentMonth = dateToCheck.getMonth() === month;
            const isToday = dateToCheck.getTime() === today.getTime();
            const isWeekend = dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6;

            days.push({
                date: new Date(dateToCheck),
                dayNumber: dateToCheck.getDate(),
                isCurrentMonth,
                isToday,
                isWeekend,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        weeks.push({ days });
    }

    return weeks;
}

/**
 * Get month name from month index (0-11)
 */
export function getMonthName(month: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

/**
 * Get short day names
 */
export function getDayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
