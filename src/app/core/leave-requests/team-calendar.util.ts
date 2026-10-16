import { eachDayOfInterval, endOfMonth, endOfWeek, format, isWeekend, startOfMonth, startOfWeek } from 'date-fns';
import { StoredUser } from '../auth/auth.models';
import { LeaveRequest } from './leave-request.models';

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  inMonth: boolean;
  isWeekend: boolean;
}

export interface MonthRef {
  year: number;
  month: number;
}

export interface DayOverlap {
  date: string;
  employeeIds: string[];
  hasOverlap: boolean;
}

export function buildMonthGrid(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = startOfMonth(new Date(year, month - 1, 1));
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(firstOfMonth), { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((day) => ({
    date: format(day, 'yyyy-MM-dd'),
    dayOfMonth: day.getDate(),
    inMonth: day.getMonth() === month - 1 && day.getFullYear() === year,
    isWeekend: isWeekend(day),
  }));

  const weeks: CalendarDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

export function detectOverlaps(
  requests: LeaveRequest[],
  employees: Array<Pick<StoredUser, 'id'>>,
  month: { year: number; month: number }
): Map<string, { employeeIds: string[]; hasOverlap: boolean }> {
  const teamIds = new Set(employees.map((employee) => employee.id));
  const byDay = new Map<string, Set<string>>();

  for (const request of requests) {
    if (request.status !== 'approuvee' || !teamIds.has(request.employeeId)) {
      continue;
    }

    const days = eachDayOfInterval({
      start: new Date(`${request.startDate}T00:00:00`),
      end: new Date(`${request.endDate}T00:00:00`),
    });

    for (const day of days) {
      if (day.getFullYear() !== month.year || day.getMonth() !== month.month - 1 || isWeekend(day)) {
        continue;
      }
      const key = format(day, 'yyyy-MM-dd');
      const set = byDay.get(key) ?? new Set<string>();
      set.add(request.employeeId);
      byDay.set(key, set);
    }
  }

  const result = new Map<string, { employeeIds: string[]; hasOverlap: boolean }>();
  for (const [date, ids] of byDay) {
    const employeeIds = [...ids];
    result.set(date, { employeeIds, hasOverlap: employeeIds.length >= 2 });
  }
  return result;
}
