/**
 * Get the current date in YYYY-MM-DD format using local timezone
 * @returns Date string in YYYY-MM-DD format
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date to YYYY-MM-DD using local timezone
 * This avoids the timezone issues with toISOString() which uses UTC
 */
export function formatLocalDate(date: Date): string {
  return getLocalDateString(date);
}
