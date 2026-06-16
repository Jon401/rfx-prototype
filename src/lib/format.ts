import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";

export function formatDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy h:mm a");
}

export function formatRelative(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function isOverdue(dueDate: string) {
  return isPast(parseISO(dueDate));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}
