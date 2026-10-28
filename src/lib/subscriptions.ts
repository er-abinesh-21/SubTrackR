import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
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

/** A one-time payment that has been paid has nothing left to charge. */
export const isPaidOneTime = (sub: Subscription) => sub.billing_cycle === "one-time" && !!sub.last_paid_at;

/**
 * The fields to save when a subscription is marked as paid: today is recorded as the
 * payment date, and a recurring subscription moves one cycle past its due date.
 * One-time payments keep their date and count as settled (see isPaidOneTime).
 */
export const markPaidUpdate = (
  sub: Subscription,
  today: Date = new Date()
): Pick<Subscription, "last_paid_at" | "next_due_date"> => {
  const stored = parseDueDate(sub.next_due_date);
  let nextDue = sub.next_due_date;
  if (stored && sub.billing_cycle === "monthly") nextDue = toDueDateString(addMonths(stored, 1));
  if (stored && sub.billing_cycle === "yearly") nextDue = toDueDateString(addYears(stored, 1));
  return { last_paid_at: toDueDateString(today), next_due_date: nextDue };
};

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
  if (isPaidOneTime(sub)) return null;
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

export interface MonthProjection {
  /** First day of the month. */
  month: Date;
  total: number;
  charges: number;
}

/**
 * What will be charged in each of the next `months` calendar months, from each active
 * subscription's schedule. Only the most-used currency is counted, like the other totals.
 * The first month only includes charges from today onward.
 */
export const projectMonthlySpend = (subs: Subscription[], today: Date = new Date(), months = 12) => {
  const active = subs.filter(isActive);
  const currency = getPrimaryCurrency(active);
  const counted = active.filter((s) => (s.currency || DEFAULT_CURRENCY) === currency);

  const firstMonth = startOfMonth(today);
  const end = addMonths(firstMonth, months);
  const result: MonthProjection[] = Array.from({ length: months }, (_, i) => ({
    month: addMonths(firstMonth, i),
    total: 0,
    charges: 0,
  }));

  for (const sub of counted) {
    const firstDue = getNextDueDate(sub, today);
    if (!firstDue) continue;
    const price = Number(sub.price) || 0;
    const recurring = sub.billing_cycle === "monthly" || sub.billing_cycle === "yearly";

    // Step from the first due date each time so a 31st-of-the-month charge does not drift.
    for (let n = 0; ; n++) {
      const due = sub.billing_cycle === "monthly" ? addMonths(firstDue, n) : sub.billing_cycle === "yearly" ? addYears(firstDue, n) : firstDue;
      if (due >= end) break;
      const slot = result[differenceInCalendarMonths(due, firstMonth)];
      slot.total += price;
      slot.charges += 1;
      if (!recurring) break;
    }
  }

  return {
    months: result,
    currency,
    total: result.reduce((sum, m) => sum + m.total, 0),
    hasOtherCurrencies: counted.length < active.length,
  };
};
