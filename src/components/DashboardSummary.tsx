import { Subscription } from "@/types";
import {
  DEFAULT_CURRENCY,
  daysUntil,
  formatCurrency,
  getNextDueDate,
  getPrimaryCurrency,
  isActive,
  monthlyCost,
  yearlyCost,
} from "@/lib/subscriptions";
import { useCountUp } from "@/hooks/use-count-up";

interface DashboardSummaryProps {
  subscriptions: Subscription[];
}

/** Splits a formatted amount so the cents can sit quieter than the whole units. */
const splitAmount = (amount: number, currency: string) => {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currencyDisplay: "narrowSymbol",
      currency,
    }).formatToParts(amount);
    const decimalAt = parts.findIndex((p) => p.type === "decimal");
    if (decimalAt === -1) return { whole: parts.map((p) => p.value).join(""), cents: "" };
    return {
      whole: parts.slice(0, decimalAt).map((p) => p.value).join(""),
      cents: parts.slice(decimalAt).map((p) => p.value).join(""),
    };
  } catch (e) {
    return { whole: formatCurrency(amount, currency), cents: "" };
  }
};

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-medium leading-none tnum sm:text-[1.75rem]">{children}</dd>
    </div>
  );
}

export function DashboardSummary({ subscriptions }: DashboardSummaryProps) {
  const activeSubscriptions = subscriptions.filter(isActive);
  const primaryCurrency = getPrimaryCurrency(activeSubscriptions);

  const subscriptionsInPrimaryCurrency = activeSubscriptions.filter(
    (s) => (s.currency || DEFAULT_CURRENCY) === primaryCurrency
  );
  const excludedCount = activeSubscriptions.length - subscriptionsInPrimaryCurrency.length;

  const monthlyTotal = subscriptionsInPrimaryCurrency.reduce((acc, sub) => acc + monthlyCost(sub), 0);
  const yearlyTotal = subscriptionsInPrimaryCurrency.reduce((acc, sub) => acc + yearlyCost(sub), 0);

  const dueThisWeekCount = activeSubscriptions.filter((sub) => {
    const next = getNextDueDate(sub);
    if (!next) return false;
    const days = daysUntil(next);
    return days >= 0 && days <= 7;
  }).length;

  const animatedMonthly = useCountUp(monthlyTotal, 1300, 150);
  const animatedYearly = useCountUp(yearlyTotal, 1300, 350);
  const hero = splitAmount(animatedMonthly, primaryCurrency);

  return (
    <section aria-label="Spending summary" className="grid items-end gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Monthly spend</p>
        <p className="mt-2 font-display font-light leading-[0.95] tracking-[-0.035em] tnum text-[clamp(3.5rem,11vw,7.25rem)]">
          <span className="sr-only">{formatCurrency(monthlyTotal, primaryCurrency)}</span>
          <span aria-hidden="true">
            {hero.whole}
            <span className="text-[0.45em] tracking-normal text-muted-foreground">{hero.cents}</span>
          </span>
        </p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          {activeSubscriptions.length === 0
            ? "Nothing tracked yet. Add a subscription to see what you spend each month."
            : excludedCount > 0
              ? `Totals include subscriptions in ${primaryCurrency}, your most-used currency. ${excludedCount} other active ${
                  excludedCount === 1 ? "subscription is" : "subscriptions are"
                } not included.`
              : "Recurring charges only. One-time payments and paused subscriptions are left out."}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-6 border-t border-border pt-6 lg:grid-cols-1 lg:gap-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        <Figure label="Yearly spend">
          <span className="sr-only">{formatCurrency(yearlyTotal, primaryCurrency)}</span>
          <span aria-hidden="true">{formatCurrency(animatedYearly, primaryCurrency)}</span>
        </Figure>
        <Figure label="Active subscriptions">{activeSubscriptions.length}</Figure>
        <Figure label="Due this week">
          <span className={dueThisWeekCount > 0 ? "text-destructive" : undefined}>{dueThisWeekCount}</span>
        </Figure>
      </dl>
    </section>
  );
}
