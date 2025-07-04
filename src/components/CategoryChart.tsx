import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

export function CategoryChart({ subscriptions }: CategoryChartProps) {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

  const chartData = useMemo(() => {
    const categoryCosts: { [key: string]: number } = {};

    subscriptions.forEach((sub) => {
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
  }, [subscriptions, view]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
      <p className="font-semibold">No subscriptions yet</p>
      <p className="text-sm mt-1">Add your first subscription to see the breakdown</p>
    </div>
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Category Breakdown</CardTitle>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
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
                content={<ChartTooltipContent hideLabel formatter={(value) => `$${value}`} />}
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
    </Card>
  );
}