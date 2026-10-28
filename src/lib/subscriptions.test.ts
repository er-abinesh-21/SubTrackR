import { describe, it, expect } from "vitest";
import { Subscription } from "@/types";
import {
  getNextDueDate,
  getPrimaryCurrency,
  isActive,
  isPaidOneTime,
  markPaidUpdate,
  monthlyCost,
  parseDueDate,
  toDueDateString,
  yearlyCost,
} from "./subscriptions";

const sub = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: "1",
  user_id: "u",
  name: "Netflix",
  price: 12,
  currency: "USD",
  category: null,
  billing_cycle: "monthly",
  next_due_date: "2026-10-26",
  is_active: true,
  created_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("due date handling", () => {
  it("round-trips a picked date without shifting the day", () => {
    const picked = day(2026, 3, 1);
    expect(toDueDateString(picked)).toBe("2026-03-01");
    expect(parseDueDate("2026-03-01")).toEqual(picked);
  });

  it("still reads legacy full ISO timestamps and rejects garbage", () => {
    expect(parseDueDate("2026-03-01T10:30:00+05:30")).toBeInstanceOf(Date);
    expect(parseDueDate("not a date")).toBeNull();
    expect(parseDueDate(undefined)).toBeNull();
  });
});

describe("costs", () => {
  it("normalises each billing cycle", () => {
    expect(monthlyCost(sub({ price: 10, billing_cycle: "monthly" }))).toBe(10);
    expect(monthlyCost(sub({ price: 120, billing_cycle: "yearly" }))).toBe(10);
    expect(monthlyCost(sub({ price: 99, billing_cycle: "one-time" }))).toBe(0);

    expect(yearlyCost(sub({ price: 10, billing_cycle: "monthly" }))).toBe(120);
    expect(yearlyCost(sub({ price: 120, billing_cycle: "yearly" }))).toBe(120);
    expect(yearlyCost(sub({ price: 99, billing_cycle: "one-time" }))).toBe(0);
  });

  it("treats a missing is_active as active", () => {
    expect(isActive(sub({ is_active: undefined as unknown as boolean }))).toBe(true);
    expect(isActive(sub({ is_active: false }))).toBe(false);
  });
});

describe("getPrimaryCurrency", () => {
  it("defaults to INR with no subscriptions", () => {
    expect(getPrimaryCurrency([])).toBe("INR");
  });

  it("picks the most common currency", () => {
    const subs = [sub({ currency: "EUR" }), sub({ currency: "EUR" }), sub({ currency: "USD" })];
    expect(getPrimaryCurrency(subs)).toBe("EUR");
  });

  it("breaks ties alphabetically regardless of input order", () => {
    const a = [sub({ currency: "USD" }), sub({ currency: "EUR" })];
    const b = [...a].reverse();
    expect(getPrimaryCurrency(a)).toBe("EUR");
    expect(getPrimaryCurrency(b)).toBe("EUR");
  });
});

describe("getNextDueDate", () => {
  const today = day(2026, 10, 26);

  it("keeps a subscription due today", () => {
    expect(getNextDueDate(sub({ next_due_date: "2026-10-26" }), today)).toEqual(today);
  });

  it("keeps future dates as they are", () => {
    expect(getNextDueDate(sub({ next_due_date: "2026-12-01" }), today)).toEqual(day(2026, 12, 1));
  });

  it("rolls a lapsed monthly subscription forward", () => {
    expect(getNextDueDate(sub({ next_due_date: "2026-07-15" }), today)).toEqual(day(2026, 11, 15));
  });

  it("rolls a lapsed yearly subscription forward", () => {
    const yearly = sub({ billing_cycle: "yearly", next_due_date: "2024-03-10" });
    expect(getNextDueDate(yearly, today)).toEqual(day(2027, 3, 10));
  });

  it("does not drift off the 31st when rolling forward", () => {
    const monthEnd = sub({ next_due_date: "2026-01-31" });
    expect(getNextDueDate(monthEnd, day(2026, 10, 26))).toEqual(day(2026, 10, 31));
    expect(getNextDueDate(monthEnd, day(2026, 11, 1))).toEqual(day(2026, 11, 30));
    expect(getNextDueDate(monthEnd, day(2026, 12, 1))).toEqual(day(2026, 12, 31));
  });

  it("has no next date for a past one-time payment or an invalid date", () => {
    expect(getNextDueDate(sub({ billing_cycle: "one-time", next_due_date: "2026-01-01" }), today)).toBeNull();
    expect(getNextDueDate(sub({ next_due_date: "garbage" }), today)).toBeNull();
  });
});

describe("markPaidUpdate", () => {
  const today = day(2026, 10, 28);

  it("records today and moves a monthly subscription one cycle ahead", () => {
    const update = markPaidUpdate(sub({ next_due_date: "2026-10-29" }), today);
    expect(update).toEqual({ last_paid_at: "2026-10-28", next_due_date: "2026-11-29" });
  });

  it("moves a yearly subscription a year ahead", () => {
    const update = markPaidUpdate(sub({ billing_cycle: "yearly", next_due_date: "2026-11-05" }), today);
    expect(update.next_due_date).toBe("2027-11-05");
  });

  it("clamps to the end of a shorter month", () => {
    const update = markPaidUpdate(sub({ next_due_date: "2026-01-31" }), today);
    expect(update.next_due_date).toBe("2026-02-28");
  });

  it("keeps the date of a one-time payment and treats it as settled", () => {
    const oneTime = sub({ billing_cycle: "one-time", next_due_date: "2026-11-15" });
    const update = markPaidUpdate(oneTime, today);
    expect(update.next_due_date).toBe("2026-11-15");

    const paid = { ...oneTime, ...update };
    expect(isPaidOneTime(paid)).toBe(true);
    expect(getNextDueDate(paid, today)).toBeNull();
    expect(isPaidOneTime(oneTime)).toBe(false);
  });
});
