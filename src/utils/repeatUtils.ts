import {
  addDays,
  parseISO,
  format,
  isBefore,
  isAfter,
  isSameDay,
  getDay,
  getDate,
  startOfDay,
} from 'date-fns';
import type { CalendarEvent, RepeatRule, ExpandedEvent } from '../types';

function getEventStartDate(event: CalendarEvent): Date {
  const s = event.startDateTime;
  return parseISO(s.length === 10 ? s : s.slice(0, 10));
}

function matchesRule(date: Date, event: CalendarEvent, rule: RepeatRule): boolean {
  const eventStart = getEventStartDate(event);

  switch (rule.frequency) {
    case 'daily':
    case 'custom': {
      const diff = Math.floor(
        (startOfDay(date).getTime() - startOfDay(eventStart).getTime()) / (86400000)
      );
      return diff >= 0 && diff % rule.interval === 0;
    }
    case 'weekly': {
      const diffWeeks = Math.floor(
        (startOfDay(date).getTime() - startOfDay(eventStart).getTime()) / (7 * 86400000)
      );
      if (diffWeeks < 0 || diffWeeks % rule.interval !== 0) return false;
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        return rule.daysOfWeek.includes(getDay(date));
      }
      return getDay(date) === getDay(eventStart);
    }
    case 'monthly': {
      const monthsDiff =
        (date.getFullYear() - eventStart.getFullYear()) * 12 +
        (date.getMonth() - eventStart.getMonth());
      if (monthsDiff < 0 || monthsDiff % rule.interval !== 0) return false;
      if (rule.dayOfMonth) return getDate(date) === rule.dayOfMonth;
      if (rule.nthWeekday) {
        const { nth, weekday } = rule.nthWeekday;
        if (getDay(date) !== weekday) return false;
        const weekOfMonth = Math.ceil(getDate(date) / 7);
        return weekOfMonth === nth;
      }
      return getDate(date) === getDate(eventStart);
    }
    case 'yearly': {
      const yearsDiff = date.getFullYear() - eventStart.getFullYear();
      if (yearsDiff < 0 || yearsDiff % rule.interval !== 0) return false;
      return date.getMonth() === eventStart.getMonth() && getDate(date) === getDate(eventStart);
    }
    default:
      return false;
  }
}

function isWithinEnd(date: Date, event: CalendarEvent, rule: RepeatRule): boolean {
  const eventStart = getEventStartDate(event);
  if (isBefore(date, eventStart) && !isSameDay(date, eventStart)) return false;

  if (rule.endType === 'until' && rule.endDate) {
    const end = parseISO(rule.endDate);
    if (isAfter(date, end) && !isSameDay(date, end)) return false;
  }
  if (rule.endType === 'count' && rule.endCount) {
    // simplified: allow up to endCount occurrences from start
    let count = 0;
    let cursor = eventStart;
    while (!isAfter(cursor, date)) {
      if (matchesRule(cursor, event, rule)) count++;
      if (count > rule.endCount) return false;
      cursor = addDays(cursor, 1);
    }
  }
  return true;
}

function expandWithRule(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
  rule: RepeatRule
): ExpandedEvent[] {
  const results: ExpandedEvent[] = [];
  let cursor = rangeStart;

  while (!isAfter(cursor, rangeEnd)) {
    if (matchesRule(cursor, event, rule) && isWithinEnd(cursor, event, rule)) {
      const dateKey = format(cursor, 'yyyy-MM-dd');
      const startTime = event.startDateTime.includes('T')
        ? event.startDateTime.slice(11)
        : '';
      const endTime = event.endDateTime.includes('T') ? event.endDateTime.slice(11) : '';

      results.push({
        ...event,
        occurrenceDate: dateKey,
        occurrenceKey: `${event.id}_${dateKey}`,
        startDateTime: startTime ? `${dateKey}T${startTime}` : dateKey,
        endDateTime: endTime ? `${dateKey}T${endTime}` : dateKey,
      });
    }
    cursor = addDays(cursor, 1);
  }
  return results;
}

export function expandEventOccurrences(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date
): ExpandedEvent[] {
  if (!event.repeat) {
    const start = startOfDay(getEventStartDate(event));
    const rs = startOfDay(rangeStart);
    const re = startOfDay(rangeEnd);
    if (isBefore(start, rs) || isAfter(start, re)) return [];
    const dateKey = format(start, 'yyyy-MM-dd');
    return [{ ...event, occurrenceDate: dateKey, occurrenceKey: `${event.id}_${dateKey}` }];
  }

  const main = expandWithRule(event, rangeStart, rangeEnd, event.repeat);
  if (event.repeat.additionalRules) {
    for (const rule of event.repeat.additionalRules) {
      main.push(...expandWithRule(event, rangeStart, rangeEnd, rule));
    }
  }
  return main;
}

export function expandEventsForRange(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): ExpandedEvent[] {
  const all: ExpandedEvent[] = [];
  for (const event of events) {
    all.push(...expandEventOccurrences(event, rangeStart, rangeEnd));
  }
  return all.sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
}

export function getEventsForDate(
  events: CalendarEvent[],
  dateKey: string
): ExpandedEvent[] {
  const date = parseISO(dateKey);
  return expandEventsForRange(events, date, date);
}
