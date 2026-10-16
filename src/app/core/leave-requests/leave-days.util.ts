import { eachDayOfInterval, isWeekend, parseISO } from 'date-fns';

export function countWorkingDays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }
  if (end.getTime() < start.getTime()) {
    return 0;
  }
  return eachDayOfInterval({ start, end }).filter((day) => !isWeekend(day)).length;
}
