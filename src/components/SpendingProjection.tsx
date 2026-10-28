import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Subscription } from "@/types";
import { formatCurrency, projectMonthlySpend } from "@/lib/subscriptions";
import { cn } from "@/lib/utils";

interface SpendingProjectionProps {
  subscriptions: Subscription[];
}

const chargesLabel = (n: number) => `${n} ${n === 1 ? "charge" : "charges"}`;

/** What you will pay in each of the next twelve months, from every subscription's schedule. */
export function SpendingProjection({ subscriptions }: SpendingProjectionProps) {
  const { months, currency, total, hasOtherCurrencies } = useMemo(() => projectMonthlySpend(subscriptions), [subscriptions]);
  const [hovered, setHovered] = useState<number | null>(null);
  // Bars grow from the baseline once on first paint, then glide when the numbers change.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const max = Math.max(...months.map((m) => m.total), 0);
  const peakIndex = months.reduce((best, m, i) => (m.total > months[best].total ? i : best), 0);
  const shownIndex = hovered ?? peakIndex;
  const shown = months[shownIndex];

  return (
    <section aria-labelledby="projection-title" className="panel overflow-hidden">
      <div className="px-5 pt-5 sm:px-7 sm:pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="projection-title" className="text-xl font-medium">
            Next 12 months
          </h2>
          {max > 0 && (
            <p className="text-sm text-muted-foreground tnum">
              {formatCurrency(total, currency)} in total, about {formatCurrency(total / months.length, currency)} a month
            </p>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on each subscription's schedule, counting from today.
          {hasOtherCurrencies && ` Only ${currency} subscriptions are included.`}
        </p>
      </div>

      {max === 0 ? (
        <p className="px-5 py-14 text-center text-muted-foreground sm:px-7">
          Nothing is scheduled in the next 12 months. Add a subscription to see your spending ahead.
        </p>
      ) : (
        <div className="px-5 pb-2 pt-6 sm:px-7">
          <div className="flex h-52 items-stretch gap-1.5 sm:gap-3">
            {months.map((m, i) => {
              const isShown = shownIndex === i;
              const height = m.total > 0 ? Math.max((m.total / max) * 100, 3) : 0;
              return (
                <button
                  key={m.month.toISOString()}
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${format(m.month, "MMMM yyyy")}, ${formatCurrency(m.total, currency)}, ${chargesLabel(m.charges)}`}
                  className="group flex min-w-0 flex-1 flex-col rounded-md outline-none focus-visible:ring-2 focus-visible:ring-highlight"
                >
                  <span className="relative flex flex-1 items-end">
                    {/* The baseline keeps empty months visible as a gap rather than a missing column. */}
                    <span className="absolute inset-x-0 bottom-0 h-px bg-border" aria-hidden="true" />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-full rounded-t-md transition-[height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isShown ? "bg-highlight" : i === 0 ? "bg-foreground/60" : "bg-foreground/25 group-hover:bg-foreground/45"
                      )}
                      style={{ height: revealed ? `${height}%` : "0%", transitionDelay: revealed ? "0ms" : `${i * 40}ms` }}
                    />
                  </span>
                  <span className={cn("mt-2 text-center text-[0.7rem] sm:text-xs", isShown ? "text-foreground" : "text-muted-foreground")}>
                    {format(m.month, "MMM")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {max > 0 && (
        <div className="mt-2 flex min-h-[64px] items-center justify-between gap-4 border-t border-border bg-background/30 px-5 py-3 sm:px-7" aria-live="polite">
          <p className="min-w-0 text-sm">
            <span className="font-medium">{format(shown.month, "MMMM yyyy")}</span>
            <span className="text-muted-foreground">
              {" "}
              {hovered === null ? "is your busiest month" : "has"}, {chargesLabel(shown.charges)}
            </span>
          </p>
          <p className="font-display text-lg font-medium tnum">{formatCurrency(shown.total, currency)}</p>
        </div>
      )}
    </section>
  );
}
