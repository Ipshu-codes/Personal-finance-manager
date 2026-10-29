
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Value for <input type="date"> in the user's local timezone.
export function toDateInput(iso?: string | null) {
  const date = iso ? new Date(iso) : new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

// Noon local time, so the day never shifts when converted to UTC.
export function fromDateInput(value: string) {
  return new Date(`${value}T12:00:00`).toISOString();
}

export function isSameMonth(iso: string, month: number, year: number) {
  const date = new Date(iso);
  return date.getMonth() + 1 === month && date.getFullYear() === year;
}
