import type { DateRange } from '../types/filters';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (left: Date, right: Date): boolean =>
  startOfDay(left).getTime() === startOfDay(right).getTime();

export const isBeforeDay = (left: Date, right: Date): boolean =>
  startOfDay(left).getTime() < startOfDay(right).getTime();

export const isWithinRange = (date: Date, range: DateRange): boolean => {
  if (!range.startDate || !range.endDate) {
    return false;
  }

  const value = startOfDay(date).getTime();
  return (
    value >= startOfDay(range.startDate).getTime() &&
    value <= startOfDay(range.endDate).getTime()
  );
};

export const formatShortDate = (date: Date): string => {
  const month = MONTHS[date.getMonth()] ?? '';
  return `${String(date.getDate()).padStart(2, '0')} ${month}`;
};

export const formatDateRange = (range: DateRange): string => {
  if (!range.startDate) {
    return 'Select dates';
  }

  if (!range.endDate) {
    return `${formatShortDate(range.startDate)} - ...`;
  }

  return `${formatShortDate(range.startDate)} - ${formatShortDate(
    range.endDate,
  )}`;
};

export const getMonthLabel = (date: Date): string => {
  const month = MONTHS[date.getMonth()] ?? '';
  return `${month} ${date.getFullYear()}`;
};

export const buildMonthDays = (visibleMonth: Date): (Date | null)[] => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const placeholders: (Date | null)[] = Array.from(
    { length: firstDay.getDay() },
    (): Date | null => null,
  );
  const days: (Date | null)[] = Array.from(
    { length: daysInMonth },
    (_, index): Date | null => new Date(year, month, index + 1),
  );

  return [...placeholders, ...days];
};
