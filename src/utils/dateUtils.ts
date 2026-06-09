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

export { isToday, isSameMonth, isSameDay, addMonths, subMonths, format, parseISO };
