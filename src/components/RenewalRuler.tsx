import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Subscription } from "@/types";
import { SubscriptionIcon } from "@/components/SubscriptionIcon";
import {
  DEFAULT_CURRENCY,
  daysUntil,
  describeDays,
  formatCurrency,
  getNextDueDate,
  getPrimaryCurrency,
  isActive,
} from "@/lib/subscriptions";
import { cn } from "@/lib/utils";

const HORIZON_DAYS = 30;
const LANE_HEIGHT = 44;
const MAX_LANES = 4;
// Minimum horizontal distance (as a share of the track) between two markers in the same lane.
const MIN_GAP = 0.075;
const SWEEP_MS = 1300;

interface Charge {
  sub: Subscription;
  date: Date;
  days: number;
  position: number;
  lane: number;
}

interface RenewalRulerProps {
  subscriptions: Subscription[];
}

export function RenewalRuler({ subscriptions }: RenewalRulerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { charges, lanes, total, totalCurrency, mixedCurrencies, today } = useMemo(() => {
    const now = new Date();
    const active = subscriptions.filter(isActive);
    const primary = getPrimaryCurrency(active);

    const upcoming = active
      .map((sub) => {
        const date = getNextDueDate(sub, now);
        return date ? { sub, date, days: daysUntil(date, now) } : null;
      })
      .filter((c): c is { sub: Subscription; date: Date; days: number } => c !== null && c.days >= 0 && c.days <= HORIZON_DAYS)
      .sort((a, b) => a.days - b.days);

    // Greedy lane assignment: nearby charges stack instead of overlapping.
    const laneEnds: number[] = [];
    const placed: Charge[] = upcoming.map((c) => {
      const position = c.days / HORIZON_DAYS;
      let lane = laneEnds.findIndex((end) => position - end >= MIN_GAP);
      if (lane === -1) lane = laneEnds.length < MAX_LANES ? laneEnds.length : MAX_LANES - 1;
      laneEnds[lane] = position;
      return { ...c, position, lane };
    });

    const inPrimary = placed.filter((c) => (c.sub.currency || DEFAULT_CURRENCY) === primary);

    return {
      charges: placed,
      lanes: Math.max(1, laneEnds.length),
      total: inPrimary.reduce((sum, c) => sum + Number(c.sub.price || 0), 0),
      totalCurrency: primary,
      mixedCurrencies: inPrimary.length < placed.length,
      today: now,
    };
  }, [subscriptions]);

  const selected = charges.find((c) => c.sub.id === hoveredId) ?? charges[0];
  const areaHeight = lanes * LANE_HEIGHT + 20;

  return (
    <section aria-labelledby="ruler-title" className="panel overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 pt-5 sm:px-7 sm:pt-6">
        <h2 id="ruler-title" className="text-xl font-medium">
          Next 30 days
        </h2>
        <p className="text-sm text-muted-foreground tnum">
          {charges.length === 0
            ? "No charges coming up"
            : `${charges.length} ${charges.length === 1 ? "charge" : "charges"}, ${formatCurrency(total, totalCurrency)}${
                mixedCurrencies ? ` in ${totalCurrency} plus other currencies` : ""
              }`}
        </p>
      </div>

      <div className="overflow-x-auto px-5 pb-2 pt-4 sm:px-7">
        <div className="relative min-w-[680px] px-4" aria-hidden={charges.length === 0 ? true : undefined}>
          {/* Marker area */}
          <div className="relative" style={{ height: areaHeight }}>
            {charges.length === 0 && (
              <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">
                Nothing renews in the next 30 days.
              </p>
            )}
            {charges.map((c) => {
              const isSelected = selected?.sub.id === c.sub.id;
              const stem = c.lane * LANE_HEIGHT + 10;
              return (
                <div
                  key={c.sub.id}
                  className="absolute bottom-0 h-0 w-8 -translate-x-1/2"
                  style={{ left: `${c.position * 100}%` }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute bottom-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-200",
                      isSelected ? "bg-highlight" : "bg-border"
                    )}
                    style={{ height: stem }}
                  />
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredId(c.sub.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(c.sub.id)}
                    onBlur={() => setHoveredId(null)}
                    aria-label={`${c.sub.name}, ${formatCurrency(c.sub.price, c.sub.currency)}, due ${format(c.date, "MMMM d")}, ${describeDays(c.days)}`}
                    className={cn(
                      "absolute left-0 rounded-lg outline-none transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-highlight",
                      isSelected && "ring-2 ring-highlight"
                    )}
                    style={{
                      bottom: stem,
                      animation: `marker-drop 520ms cubic-bezier(0.22, 1, 0.36, 1) backwards`,
                      animationDelay: `${Math.round(c.position * SWEEP_MS + 180)}ms`,
                    }}
                  >
                    <SubscriptionIcon name={c.sub.name} size="sm" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Axis */}
          <div className="relative h-px bg-border" aria-hidden="true">
            <span
              className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_0_4px_hsl(var(--highlight)/0.2)]"
            />
            <span
              className="pointer-events-none absolute bottom-[-30px] w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-highlight to-transparent opacity-0"
              style={{
                top: -areaHeight,
                animation: `sweep ${SWEEP_MS}ms cubic-bezier(0.45, 0, 0.2, 1) both`,
                boxShadow: "0 0 14px 1px hsl(var(--highlight) / 0.55)",
              }}
            />
          </div>

          {/* Ticks and week labels */}
          <div className="relative h-9" aria-hidden="true">
            {Array.from({ length: HORIZON_DAYS + 1 }, (_, i) => {
              const isWeek = i % 7 === 0;
              const position = i / HORIZON_DAYS;
              return (
                <div
                  key={i}
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${position * 100}%` }}
                >
                  <span
                    className={cn("w-px origin-top bg-border", isWeek ? "h-2.5 bg-muted-foreground/60" : "h-1.5")}
                    style={{
                      animation: "tick-in 380ms ease-out backwards",
                      animationDelay: `${Math.round(position * SWEEP_MS)}ms`,
                    }}
                  />
                  {isWeek && (
                    <span
                      className={cn(
                        "mt-1 whitespace-nowrap text-xs tnum",
                        i === 0 ? "font-medium text-highlight" : "text-muted-foreground"
                      )}
                    >
                      {i === 0 ? "Today" : format(addDays(today, i), "MMM d")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Readout: shows the charge under the pointer, or the next one coming up. */}
      <div className="flex min-h-[64px] items-center gap-3 border-t border-border bg-background/30 px-5 py-3 sm:px-7" aria-live="polite">
        {selected ? (
          <>
            <SubscriptionIcon name={selected.sub.name} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="font-medium">{selected.sub.name}</span>
              <span className="text-muted-foreground">
                {" "}
                charges {describeDays(selected.days)}, {format(selected.date, "EEE, MMM d")}
              </span>
            </p>
            <p className="font-display text-lg font-medium tnum">{formatCurrency(selected.sub.price, selected.sub.currency)}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            When a subscription is due within a month it lands on this timeline.
          </p>
        )}
      </div>
    </section>
  );
}
