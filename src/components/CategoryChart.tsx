import { useEffect, useMemo, useState } from "react";
import { Subscription } from "@/types";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getPrimaryCurrency,
  isActive,
  monthlyCost,
  yearlyCost,
} from "@/lib/subscriptions";
import { cn } from "@/lib/utils";

interface CategoryChartProps {
  subscriptions: Subscription[];
}

type View = "monthly" | "yearly";

const VIEWS: { value: View; label: string; unit: string }[] = [
  { value: "monthly", label: "Monthly", unit: "a month" },
  { value: "yearly", label: "Yearly", unit: "a year" },
];

// Cherry highlight leads, then Cotton and warm tints; past the fixed set, hues are spread around the wheel.
const COLORS = [
  "hsl(var(--highlight))",
  "hsl(var(--foreground))",
  "hsl(var(--blush))",
  "hsl(var(--brick))",
  "hsl(var(--sand))",
  "#F3A08A",
  "#8F6B6B",
  "#D4D0BE",
];
const getColor = (index: number) =>
  index < COLORS.length ? COLORS[index] : `hsl(${((index - COLORS.length) * 47 + 20) % 360} 60% 68%)`;

export function CategoryChart({ subscriptions }: CategoryChartProps) {
  const [view, setView] = useState<View>("monthly");
  const [highlight, setHighlight] = useState<string | null>(null);
  // Segments grow from zero once on first paint, then glide between views.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { rows, total, primaryCurrency, hasOtherCurrencies } = useMemo(() => {
    const active = subscriptions.filter(isActive);
    const primaryCurrency = getPrimaryCurrency(active);
    const inPrimary = active.filter((s) => (s.currency || DEFAULT_CURRENCY) === primaryCurrency);
    const cost = view === "monthly" ? monthlyCost : yearlyCost;

    const categoryCosts: { [key: string]: number } = {};
    inPrimary.forEach((sub) => {
      const amount = cost(sub);
      if (amount <= 0) return;
      const category = sub.category || "Uncategorized";
      categoryCosts[category] = (categoryCosts[category] || 0) + amount;
    });

    const entries = Object.entries(categoryCosts).sort(([, a], [, b]) => b - a);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    const rows = entries.map(([name, value], index) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      share: total > 0 ? value / total : 0,
      color: getColor(index),
    }));

    return { rows, total, primaryCurrency, hasOtherCurrencies: inPrimary.length < active.length };
  }, [subscriptions, view]);

  const unit = VIEWS.find((v) => v.value === view)!.unit;

  return (
    <section aria-labelledby="breakdown-title" className="panel flex h-full flex-col p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="breakdown-title" className="text-xl font-medium">
          Where it goes
        </h2>
        <div role="group" aria-label="Time period" className="flex rounded-[10px] bg-background/60 p-1 ring-1 ring-border">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              aria-pressed={view === v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "rounded-[7px] px-3.5 py-1.5 text-sm font-medium transition-[background-color,color] duration-200",
                view === v.value
                  ? "bg-secondary text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="h-3.5 rounded-full bg-secondary" aria-hidden="true" />
          <p className="mt-5 font-medium">No recurring costs yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Add an active monthly or yearly subscription to see how your spending splits by category.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex h-3.5 gap-[3px] overflow-hidden rounded-full" role="img" aria-label="Spending share by category">
            {rows.map((row) => (
              <div
                key={row.name}
                className="h-full min-w-[4px] rounded-[3px] transition-[width,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: revealed ? `${row.share * 100}%` : "0%",
                  backgroundColor: row.color,
                  opacity: highlight && highlight !== row.name ? 0.25 : 1,
                }}
              />
            ))}
          </div>

          <ul className="mt-5 flex-1 divide-y divide-border">
            {rows.map((row) => (
              <li
                key={row.name}
                onMouseEnter={() => setHighlight(row.name)}
                onMouseLeave={() => setHighlight(null)}
                className={cn(
                  "flex items-center gap-3 py-3 transition-opacity duration-200",
                  highlight && highlight !== row.name && "opacity-45"
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{row.name}</span>
                <span className="w-12 text-right text-sm text-muted-foreground tnum">{Math.round(row.share * 100)}%</span>
                <span className="w-24 text-right font-medium tnum">{formatCurrency(row.value, primaryCurrency)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">
            {formatCurrency(total, primaryCurrency)} {unit} across {rows.length} {rows.length === 1 ? "category" : "categories"}.
            {hasOtherCurrencies && ` Only ${primaryCurrency} subscriptions are shown.`}
          </p>
        </>
      )}
    </section>
  );
}
