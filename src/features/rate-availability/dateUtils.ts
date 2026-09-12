export interface DateItem {
  date: Date;
  key: string;       // e.g. "29 Jun"
  iso: string;       // e.g. "2026-06-29"
  label: string;     // e.g. "29 Jun"
  day: string;       // e.g. "Mon"
  fullDay: string;   // e.g. "Monday"
  display: string;   // e.g. "29/06/2026"
  isWeekend: boolean;// Saturday, Sunday
  isPeak: boolean;   // Friday, Saturday, Sunday
}

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format a Date object to "YYYY-MM-DD" for native HTML5 date input
 */
export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to "DD/MM/YYYY"
 */
export function formatDisplayDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format to "DD-MMM-YYYY", e.g. "29-Jun-2026"
 */
export function formatHumanDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Parse a date from ISO string (YYYY-MM-DD) or DD/MM/YYYY or fallback
 */
export function parseDateInput(val: string): Date {
  if (!val) return new Date(2026, 5, 29); // Default: 29 June 2026

  // Check YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // Check DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date(2026, 5, 29) : parsed;
}

/**
 * Add or subtract days from a date
 */
export function shiftDate(baseDate: Date, days: number): Date {
  const res = new Date(baseDate);
  res.setDate(res.getDate() + days);
  return res;
}

/**
 * Generate an array of consecutive DateItems
 */
export function generateDateItems(startDate: Date, count: number = 14): DateItem[] {
  const items: DateItem[] = [];
  for (let i = 0; i < count; i++) {
    const d = shiftDate(startDate, i);
    const dayIndex = d.getDay();
    const dayName = DAY_NAMES_SHORT[dayIndex];
    const fullDayName = DAY_NAMES_FULL[dayIndex];
    const dayNumber = String(d.getDate()).padStart(2, '0');
    const monthName = MONTH_NAMES_SHORT[d.getMonth()];
    const key = `${dayNumber} ${monthName}`;
    const iso = formatISODate(d);
    const display = formatDisplayDate(d);
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const isPeak = dayIndex === 5 || dayIndex === 6 || dayIndex === 0; // Fri, Sat, Sun

    items.push({
      date: d,
      key,
      iso,
      label: key,
      day: dayName,
      fullDay: fullDayName,
      display,
      isWeekend,
      isPeak,
    });
  }
  return items;
}

/**
 * Export data to a downloadable CSV file
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
