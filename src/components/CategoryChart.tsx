import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Subscription } from "@/types";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface CategoryChartProps {
  subscriptions: Subscription[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#ff4d4d"];

const getMostCommonCurrency = (subs: Subscription[]): string => {
    if (subs.length === 0) return 'USD';
    const counts: { [key: string]: number } = {};
    subs.forEach(s => {
        const currency = s.currency || 'USD';
        counts[currency] = (counts[currency] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) return 'USD';
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

export function CategoryChart({ subscriptions }: CategoryChartProps) {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  
  const allCurrencies = new Set(subscriptions.map(s => s.currency || 'USD'));
  const primaryCurrency = getMostCommonCurrency(subscriptions);
  const subscriptionsInPrimaryCurrency = subscriptions.filter(s => (s.currency || 'USD') === primaryCurrency);

  const chartData = useMemo(() => {
    const categoryCosts: { [key: string]: number } = {};

    subscriptionsInPrimaryCurrency.forEach((sub) => {
      const category = sub.category || "Uncategorized";
      let cost = Number(sub.price);

      if (view === 'monthly') {
        if (sub.billing_cycle === 'monthly') {
          categoryCosts[category] = (categoryCosts[category] || 0) + cost;
        }
      } else {
        if (sub.billing_cycle === 'monthly') {
          cost *= 12;
        }
        if (sub.billing_cycle !== 'one-time') {
          categoryCosts[category] = (categoryCosts[category] || 0) + cost;
        }
      }
    });

    return Object.entries(categoryCosts).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [subscriptionsInPrimaryCurrency, view]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
      <p className="font-semibold">No subscriptions yet</p>
      <p className="text-sm mt-1">Add your first subscription to see the breakdown</p>
    </div>
  );

  return (
    <Card className="flex flex-col h-full card-neon-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-neon">Category Breakdown</CardTitle>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
          <Button 
            variant={view === 'monthly' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setView('monthly')}
            className="h-7 px-3"
          >
            Monthly
          </Button>
          <Button 
            variant={view === 'yearly' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setView('yearly')}
            className="h-7 px-3"
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        {chartData.length === 0 ? (
          emptyState
        ) : (
          <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel formatter={(value) => `${primaryCurrency} ${value}`} />}
              />
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      {allCurrencies.size > 1 && chartData.length > 0 && (
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Note: Chart is showing data for your primary currency ({primaryCurrency}).
            </p>
        </CardFooter>
      )}
    </Card>
  );
}