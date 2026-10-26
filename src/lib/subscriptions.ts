import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { Subscription } from "@/types";

export const DEFAULT_CURRENCY = "INR";

export const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currencyDisplay: "narrowSymbol",
      currency: currency || DEFAULT_CURRENCY,
    }).format(amount);
  } catch (e) {
    return `${(currency || DEFAULT_CURRENCY).toUpperCase()} ${Number(amount).toFixed(2)}`;
  }
};

/**
 * Due dates are stored as plain `yyyy-MM-dd` strings so they never shift across
 * time zones. Older documents may hold a full ISO timestamp; parseISO reads both.
 */
export const toDueDateString = (date: Date) => format(date, "yyyy-MM-dd");

export const parseDueDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

export const isActive = (sub: Subscription) => sub.is_active !== false;

/**
 * The currency used by most subscriptions. Ties resolve alphabetically so the
 * result does not depend on the order documents are returned in.
 */
export const getPrimaryCurrency = (subs: Subscription[]): string => {
  const counts = new Map<string, number>();
  subs.forEach((s) => {
    const currency = s.currency || DEFAULT_CURRENCY;
    counts.set(currency, (counts.get(currency) || 0) + 1);
  });
  if (counts.size === 0) return DEFAULT_CURRENCY;

  return [...counts.entries()].sort(
    ([codeA, countA], [codeB, countB]) => countB - countA || codeA.localeCompare(codeB)
  )[0][0];
};

/** What a subscription costs per month; one-time payments are not recurring. */
export const monthlyCost = (sub: Subscription): number => {
  const price = Number(sub.price) || 0;
  if (sub.billing_cycle === "monthly") return price;
  if (sub.billing_cycle === "yearly") return price / 12;
  return 0;
};

/** What a subscription costs per year; one-time payments are not recurring. */
export const yearlyCost = (sub: Subscription): number => {
  const price = Number(sub.price) || 0;
  if (sub.billing_cycle === "monthly") return price * 12;
  if (sub.billing_cycle === "yearly") return price;
  return 0;
};

/**
 * The next time the subscription will be charged, on or after `today`.
 * Recurring subscriptions roll forward from their stored date; a one-time
 * payment that is already in the past has no next date.
 */
export const getNextDueDate = (sub: Subscription, today: Date = new Date()): Date | null => {
  const stored = parseDueDate(sub.next_due_date);
  if (!stored) return null;

  const start = startOfDay(today);
  const anchor = startOfDay(stored);
  if (anchor >= start) return anchor;

  const step = sub.billing_cycle === "monthly" ? addMonths : sub.billing_cycle === "yearly" ? addYears : null;
  if (!step) return null;

  // Step from the anchor each time (rather than adding to the previous result)
  // so a 31st-of-the-month subscription does not drift to the 28th.
  let n = 1;
  let next = step(anchor, n);
  while (next < start) {
    n += 1;
    next = step(anchor, n);
  }
  return next;
};

export const daysUntil = (date: Date, today: Date = new Date()) =>
  differenceInCalendarDays(date, today);

/** "today", "tomorrow", "in 5 days" — how a charge is described relative to now. */
export const describeDays = (days: number) => {
  if (days <= 0) return days === 0 ? "today" : `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`;
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
};
