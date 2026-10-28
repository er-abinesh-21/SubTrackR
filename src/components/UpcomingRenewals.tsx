import { Subscription } from "@/types";
import { format } from "date-fns";
import { CalendarClock, Check } from "lucide-react";
import { SubscriptionIcon } from "./SubscriptionIcon";
import { daysUntil, describeDays, formatCurrency, getNextDueDate, isActive } from "@/lib/subscriptions";
import { cn } from "@/lib/utils";

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  onMarkPaid?: (subscription: Subscription) => void;
}

export function UpcomingRenewals({ subscriptions, onMarkPaid }: UpcomingRenewalsProps) {
  const upcoming = subscriptions
    .filter(isActive)
    .map((sub) => ({ sub, dueDate: getNextDueDate(sub) }))
    .filter((entry): entry is { sub: Subscription; dueDate: Date } => entry.dueDate !== null)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  return (
    <section aria-labelledby="renewals-title" className="panel flex h-full flex-col p-5 sm:p-7">
      <h2 id="renewals-title" className="text-xl font-medium">
        Upcoming Renewals
      </h2>

      {upcoming.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-3 py-10">
          <CalendarClock className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="font-medium">No upcoming renewals</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Active subscriptions with a next charge date show up here, soonest first.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-4 flex-1 divide-y divide-border">
          {upcoming.map(({ sub, dueDate }) => {
            const days = daysUntil(dueDate);
            const soon = days <= 3;
            return (
              <li key={sub.id} className="flex items-center gap-3 py-3.5">
                <SubscriptionIcon name={sub.name} brand={sub.brand} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{sub.name}</p>
                  <p className="text-sm text-muted-foreground tnum">
                    {format(dueDate, "MMM dd, yyyy")}
                    <span className={cn("ml-2", soon && "text-destructive")}>{describeDays(days)}</span>
                  </p>
                </div>
                <p className="font-medium tnum">{formatCurrency(sub.price, sub.currency)}</p>
                {onMarkPaid && (
                  <button
                    type="button"
                    onClick={() => onMarkPaid(sub)}
                    aria-label={`Mark ${sub.name} as paid`}
                    title="Mark as paid"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground hover:ring-primary"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
