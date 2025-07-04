import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Subscription } from "@/types";
import { useMemo } from "react";

interface CategoryChartProps {
  subscriptions: Subscription[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#ff4d4d"];

export function CategoryChart({ subscriptions }: CategoryChartProps) {
  const chartData = useMemo(() => {
    const categoryCosts: { [key: string]: number } = {};

    subscriptions.forEach((sub) => {
      const category = sub.category || "Uncategorized";
      let cost = Number(sub.price);
      if (sub.billing_cycle === "monthly") {
        cost *= 12;
      }
      
      if (sub.billing_cycle !== 'one-time') {
        categoryCosts[category] = (categoryCosts[category] || 0) + cost;
      }
    });

    return Object.entries(categoryCosts).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [subscriptions]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Annual recurring cost by category.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Add subscriptions to see a breakdown.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Annual recurring cost by category.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `$${value}`} />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}