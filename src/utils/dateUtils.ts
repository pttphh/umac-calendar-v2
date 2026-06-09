import {
  format,
  parseISO,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatMonthYear(date: Date): string {
  return format(date, 'yyyy년 M월', { locale: ko });
}

export function formatDateChip(dateStr: string): string {
  const d = parseISO(dateStr.length === 10 ? dateStr : dateStr.slice(0, 10));
  return format(d, 'M/d (EEE)', { locale: ko });
}

export function formatDateLong(dateStr: string): string {
  const d = parseISO(dateStr.length === 10 ? dateStr : dateStr.slice(0, 10));
  return format(d, 'yyyy년 M월 d일 (EEE)', { locale: ko });
}

export function formatTime(dateTime: string): string {
  if (dateTime.length <= 10) return '';
  const d = parseISO(dateTime);
  return format(d, 'HH:mm');
}

export function formatDateTime(dateTime: string): string {
  if (dateTime.length <= 10) return formatDateLong(dateTime);
  const d = parseISO(dateTime);
  return `${format(d, 'M/d (EEE)', { locale: ko })} ${format(d, 'HH:mm')}`;
}

/** 피드용: "오늘, 오후 4:30" / "6/9 (월), 오후 4:30" */
export function formatFeedDateTime(dateTime: string): string {
  const d = parseISO(dateTime);
  const hour = d.getHours();
  const minute = format(d, 'mm');
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;
  const timeStr = `${period} ${hour12}:${minute}`;
  if (isToday(d)) return `오늘, ${timeStr}`;
  return `${format(d, 'M/d (EEE)', { locale: ko })}, ${timeStr}`;
}

export function formatEventSchedule(dateTime: string, isAllDay: boolean): string {
  if (isAllDay || dateTime.length <= 10) return formatDateLong(dateTime);
  const d = parseISO(dateTime);
  const hour = d.getHours();
  const minute = format(d, 'mm');
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;
  return `${format(d, 'M/d (EEE)', { locale: ko })} ${period} ${hour12}:${minute}`;
}

export function formatDatePill(dateStr: string): string {
  const d = parseISO(dateStr);
  return format(d, 'M월 d일 (EEE)', { locale: ko });
}

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function formatWeekRange(date: Date): string {
  const days = getWeekDays(date);
  const start = days[0];
  const end = days[6];
  if (start.getMonth() === end.getMonth()) {
    return format(start, 'yyyy년 M월 d일', { locale: ko }) + ' – ' + format(end, 'd일', { locale: ko });
  }
  return (
    format(start, 'M월 d일', { locale: ko }) + ' – ' + format(end, 'M월 d일', { locale: ko })
  );
}

export {
  isToday,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
};
